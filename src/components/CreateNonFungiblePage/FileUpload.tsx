import React, { createRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { useSelector, useDispatch } from '../../reducer';
import { readFileAsDataUrlAction } from '../../reducer/async/actions';
import {
  updateDisplayImageFile,
  SelectedFile
} from '../../reducer/slices/createNft';

export function FilePreview({ file }: { file: SelectedFile }) {
  const dispatch = useDispatch();
  if (/^image\/.*/.test(file.type)) {
    return (
      <Image
        src={file.objectUrl}
        width="100%"
        height="100%"
        objectFit="scale-down"
      />
    );
  }
  if (/^video\/.*/.test(file.type)) {
    const canvasRef = createRef<HTMLCanvasElement>();
    return (
      <>
        <video
          controls
          onLoadedData={e => {
            const canvas = canvasRef.current;
            if (!canvas) {
              return console.error('`canvasRef` current element is null');
            }
            const video = e.currentTarget;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var canvasContext = canvas.getContext('2d');
            if (!canvasContext) {
              return console.error('`2d` canvas context not supported');
            }
            canvasContext.drawImage(video, 0, 0);
            const type = 'image/png';
            canvas.toBlob(blob => {
              if (!blob) {
                return console.error('Could not convert canvas to blob');
              }
              dispatch(
                updateDisplayImageFile({
                  objectUrl: URL.createObjectURL(blob),
                  name: 'foo',
                  size: blob.size,
                  type: blob.type
                })
              );
            }, type);
          }}
        >
          <source src={file.objectUrl} type={file.type} />
        </video>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </>
    );
  }
  if (file.type === 'model/gltf+json' || file.type === 'model/gltf-binary') {
    return (
      <>
        <model-viewer
          camera-controls
          auto-rotate
          data-js-focus-visible
          src={file.objectUrl}
          class="upload-preview"
        ></model-viewer>
      </>
    );
  }
  return null;
}

export default function FileUpload() {
  const state = useSelector(s => s.createNft);
  const dispatch = useDispatch();

  const onDrop = useCallback(
    (files: File[]) => {
      dispatch(readFileAsDataUrlAction({ ns: 'createNft', file: files[0] }));
    },
    [dispatch]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024,
    accept: [
      'image/*',
      'video/*',
      'model/gltf-binary',
      'model/gltf+json',
      '.gltf',
      '.glb'
    ]
  });

  return (
    <Flex
      align="center"
      flexDir="column"
      width="100%"
      flex="1"
      pt={{
        base: 2,
        md: 12
      }}
    >
      <Heading size="lg" paddingBottom={8} textAlign="center">
        Upload your file
      </Heading>
      <Text
        fontSize="xs"
        color="brand.blue"
        fontFamily="mono"
        textAlign="center"
        pb={4}
      >
        JPG, PNG, GIF, WEBP, SVG, MP4, WebM, Ogg, Gltf, Glb. Max size 30mb
      </Text>
      <Flex
        borderStyle="dashed"
        borderWidth="2px"
        borderColor="brand.lightBlue"
        borderRadius="3px"
        width="100%"
        justify="center"
        align="center"
        {...getRootProps()}
      >
        <Box as="input" {...getInputProps()} />
        {state.selectedFile?.objectUrl ? (
          <Box p={4}>
            <Flex
              justify="center"
              align="center"
              maxWidth="400px"
              maxHeight="400px"
              overflow="hidden"
            >
              <FilePreview file={state.selectedFile} />
            </Flex>
          </Box>
        ) : (
          <Flex
            borderColor="white"
            borderWidth="1px"
            flexDir="column"
            align="center"
            py={24}
            bg="brand.brightGray"
            flex="1"
          >
            <Text fontSize={20} textAlign="center" paddingX={4}>
              Click or drag file to this area to upload
            </Text>
            <Text fontSize={18} color="brand.gray">
              Support for single file
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
