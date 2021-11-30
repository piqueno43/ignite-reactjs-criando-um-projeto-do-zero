import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Head from 'next/head';
import Link from 'next/link';

import { useRouter } from 'next/router';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useMemo } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { Utterances } from '../../components/Utterances';
import PreviewButton from '../../components/PreviewButton';

interface NavigationProps {
  uid: string;
  data: {
    title: string;
  }
}

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  next_page: NavigationProps;
  prev_page: NavigationProps;
  preview: boolean;
}





export default function Post({
  post,
  next_page,
  prev_page,
  preview,
}: PostProps): JSX.Element {
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
          <img src={post.data.banner.url} alt={post.data.title} />
        </figure>
        <section className={commonStyles.content}>
          <header className={styles.postHeader}>
            <h1 className={commonStyles.title}>{post.data.title}</h1>
            <footer className={commonStyles.info}>
              <time dateTime="">
                <FiCalendar />
                {format(new Date(post.first_publication_date), ' dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> {estimatedReadingTime} min
              </span>
              <div className={styles.updatedAt}>
                {format(
                  new Date(post.last_publication_date),
                  "'* editado em' dd MMM yyyy 'às' HH':'mm",
                  {
                    locale: ptBR,
                  }
                )}
              </div>
            </footer>
          </header>
          <div className={styles.postMore}>
            {post.data.content.map((content, index) => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}/>
              </div>
            ))}
          </div>
          <nav className={styles.navPosts}>
            <div className={styles.prevPost}>
              {prev_page && (
                <>
                <span>{prev_page.data.title}</span>
                <Link href={`/post/${prev_page.uid}`}>
                  <a>
                    Post anterior
                  </a>
                </Link>
                </>)}
            </div>
            <div className={styles.nextPost}>
            {next_page && (
                <>
                <span>{next_page.data.title}</span>
                <Link href={`/post/${next_page.uid}`}>
                  <a>
                    Próximo post
                  </a>
                </Link>
                </>)
              }
            </div>
          </nav>
          <Utterances />
          {preview && <PreviewButton />}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const { results } = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      orderings: '[posts.first_publication_date desc]'
    }
  );

  const paths = results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const doc = await prismic.getByUID(
    'posts',
    String(slug),
    {
      ref: previewData?.ref ?? null,
    }
  );


  const nextResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: doc.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: doc.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const next_page = nextResponse.results[0] || null;
  const prev_page = prevResponse.results[0] || null;

  return {
    props: {
      post: doc,
      preview,
      next_page,
      prev_page,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
