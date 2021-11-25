import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head'
import React, { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [next_page, setNextPage] = useState(postsPagination.next_page);

  const formattedPosts = posts.map((post) => {
    return {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date), 'dd LLL yyyy', {
        locale: ptBR,
      }),
    }
  }
  );


  async function loadMorePosts() {
    await fetch(next_page)
     .then(res => res.json())
     .then(res => {
        setNextPage(res.next_page);
        setPosts([...posts, ...res.results]);
     });
   }

  return (
    <>
       <Head>
        <title>Home | SpaceTraveling</title>
      </Head>
      <Header className="header"/>
      <main className={commonStyles.container}>
        <section className={commonStyles.content}>
          {formattedPosts.map((post) => (
            <article key={post.uid} className={commonStyles.post}>
              <Link href={`/post/${post.uid}`} passHref>
                <a>
                  <h2 className={commonStyles.title}>{post.data.title}</h2>
                  <p className={commonStyles.description}>{post.data.subtitle}</p>
                  <footer className={commonStyles.info}>
                    <time dateTime="2021-03-15"><FiCalendar />{post.first_publication_date}</time>
                    <span><FiUser/> {post.data.author}</span>
                  </footer>
                </a>
              </Link>
            </article>
          ))}
          {
            next_page &&
             (
              <footer className={styles.footer}>
                <a className={styles.loadMorePostsButton} onClick={loadMorePosts}>Carregar mais posts</a>
              </footer>
            )
          }
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  }
};
