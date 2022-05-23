import {
    Button,
    Container,
    Spinner,
    useBoolean,
    VStack,
    Image,
    Box,
    theme,
    HStack,
    AspectRatio,
    Text,
} from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ffmpeg = createFFmpeg({ log: true });

function App() {
    const [ready, setReady] = useBoolean();
    const [video, setVideo] = useState<File | null>();
    const [videoSrc, setVideoSrc] = useState<string>();
    const [gif, setGif] = useState<string>();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => setVideo(files[0]),
    });

    useEffect(() => {
        (async () => {
            await ffmpeg.load();
            setReady.on();
        })();
    }, []);

    useEffect(() => {
        video && setVideoSrc(URL.createObjectURL(video));
    }, [video]);

    const convertToGif = async () => {
        ffmpeg.FS('writeFile', 'in.mp4', await fetchFile(video));
        await ffmpeg.run('-i', 'in.mp4', '-f', 'gif', 'out.gif');
        const data = ffmpeg.FS('readFile', 'out.gif');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
        setGif(url);
    };

    return (
        <Container maxW={'4xl'} height={'100%'} display={'grid'} placeItems={'center'}>
            <Global
                styles={css`
                    html,
                    body,
                    #root {
                        height: 100%;
                    }

                    * {
                        font-family: 'Jost', sans-serif;
                    }
                `}
            />

            {ready ? (
                <VStack gap={6} width={'100%'}>
                    <HStack width={'100%'}>
                        <Box
                            height={300}
                            flex={1}
                            border={2}
                            borderStyle={'dashed'}
                            borderColor={theme.colors.gray[200]}
                            display={'grid'}
                            placeItems={'center'}
                            {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Text>
                                {video
                                    ? "I'm so proud of you"
                                    : isDragActive
                                    ? 'Almost there!'
                                    : 'Drag a video here...'}
                            </Text>
                        </Box>
                        <AspectRatio
                            background={theme.colors.gray[50]}
                            flex={1}
                            ratio={1}
                            maxH={300}>
                            {videoSrc ? (
                                <video src={videoSrc} autoPlay controls />
                            ) : (
                                <Text>To see it appear here...</Text>
                            )}
                        </AspectRatio>
                    </HStack>
                    <Button w={300} disabled={!video} onClick={convertToGif}>
                        {gif ? 'Wow, very saucy' : 'So you can hit this button...'}
                    </Button>
                    <Box
                        borderRadius={'lg'}
                        width={'100%'}
                        display={'grid'}
                        placeItems={'center'}
                        height={300}>
                        {gif ? <Image src={gif} /> : <Text>And get your new shiny GIF!</Text>}
                    </Box>
                </VStack>
            ) : (
                <Spinner />
            )}
        </Container>
    );
}

export default App;
