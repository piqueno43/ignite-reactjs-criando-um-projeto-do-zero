import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom";
import Head from 'next/head';

import {  useRouter } from 'next/router';

import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const estimatedReadingTime = useMemo(() => {
      const wordsPerMinute = 200;

      const words = post.data.content.reduce((acc, curr) => {
        const content = RichText.asText(curr.body);

        return acc + content.split(' ').length;
      }, 0);

      return Math.ceil(words / wordsPerMinute);
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  return (
    <>
       <Head>
        <title>Home | {post.data.title}</title>
      </Head>
      <Header />
      <main className={commonStyles.containerFluid}>
        <figure className={styles.postImage}>
          <img src={post.data.banner.url} alt={post.data.title}/>
        </figure>
        <section className={commonStyles.content}>
          <header className={styles.postHeader}>
            <h1 className={commonStyles.title}>{post.data.title}</h1>
            <footer className={commonStyles.info}>
              <time dateTime=""><FiCalendar /> {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
        locale: ptBR,
      })}</time>
              <span><FiUser /> {post.data.author}</span>
              <span><FiClock/> {estimatedReadingTime} min</span>
            </footer>
          </header>
          <div>
            {post.data.content.map((content, index) => (
              <article key={index}>
                <h2>{content.heading}</h2>
                <div className={styles.postContent}dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} key={index} />
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {fetch: [], pageSize: 5, orderings: '[posts.first_publication_date]'}
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps= async (context) => {

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(context.params.slug), {});

  return {
    props: {
      post: response,
    },
  };
};
