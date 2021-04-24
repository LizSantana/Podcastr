import { format, parseISO } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/playerContext';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    description: string;
    duration: number;
    durationAsString: string;
    publishedAt: string;
    url: string;
}
type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();
    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>
            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />


        </div>

    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    } // Dia 4 - se for mais de 50 págs, usa o métódo de colocar só as 50 mais usadas estáticas e as outras pra carregar depois

}
export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`)
    //Estranho, dia 4 tá assim
    /* const { data } = await api.get('episodes') {
         params: {
             _limit: 2,
             _sort: 'published_at',
             _order: 'desc'
         }
     })*/

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'a MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    };

    return {
        props: { episode },
        revalidate: 60 * 60 * 24, //24 horas
    }

}