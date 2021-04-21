import { GetStaticProps } from 'next';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';

type Episodes = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  description: string;
  duration: string;
  durationAsString: string;
  publishedAt: string;
  url: string;

}
type HomeProps = {
  lastestEpisodes: Episodes[];
  allEpisodes: Episodes[];//episodes: Array<Episodes>  
}

export default function Home({ lastestEpisodes, allEpisodes }: HomeProps) {


  /* SPA
   return (
      <h1>Index</h1>
  )

   useEffect(() => {
     fetch('http://localhost:3333/episodes')
       .then(response => response.json())
       .then(data => console.log(data))
   }, [])*/

  //SSG ******************************************************************************//
  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {lastestEpisodes.map(episode => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} src={episode.thumbnail} alt={episode.title}
                  objectFit="cover" />

                <div className={styles.episodeDetails}>
                  <a href="">{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>

              </li>
            )
          })}
        </ul>

      </section>

      <section className={styles.allEpisodes}>

      </section>
    </div>
  )
}
//  Tava dentro da div <p>{JSON.stringify(props.episodes)/*new Date(props.episodes[0].published_at).toLocaleDateString*/}</p>

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'a MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    };
  })


  /*const response = await fetch('http://localhost:3333/episodes?_limit=12&_sort=published_ad&_order=desc')
  const data = await response.json()*/

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }

}
// SSR ************************************************************************************************
/* export default function Home(props) {
  //console.log(props.episodes)
  return (
    <div>
      <h1>Index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </div>


export async function getServerSideProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data,
    }
  }

} */