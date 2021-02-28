import React, { createRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { useSelector, useDispatch } from '../../reducer';
import { readFileAsDataUrlAction } from '../../reducer/async/actions';
import {
  updateDisplayImageFile,
  SelectedFile
} from '../../reducer/slices/createNft';
import { OBJModel, GLTFModel, DAEModel } from 'react-3d-viewer';

export function FilePreview({ file }: { file: SelectedFile }) {
  const dispatch = useDispatch();
  if (/^image\/.*/.test(file.type)) {
    return <Image src={file.objectUrl} />;
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
  // TODO: Extract to component.
  if (/.*\.obj/.test(file.name)) {
    return <OBJModel src={file.objectUrl}/>;
  }
  if (/.*\.(gltf|glb)/.test(file.name)) {
    return <GLTFModel src={file.objectUrl} />
  }
  if (/.*\.dae/.test(file.name)) {
    return <DAEModel src={file.objectUrl} />
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
  });

  return (
    <Flex align="center" flexDir="column" width="100%" flex="1" pt={28}>
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
        JPG, PNG, GIF, WEBP, SVG. Max size 30mb
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
          <Box p={4} maxWidth="400px" maxHeight="400px">
            <FilePreview file={state.selectedFile} />
          </Box>
        ) : (
          <Flex
            borderColor="white"
            borderWidth="1px"
            flexDir="column"
            align="center"
            py={10}
            bg="brand.brightGray"
            flex="1"
          >
            <Text fontSize={20}>Click or drag file to this area to upload</Text>
            <Text fontSize={18} color="brand.gray">
              Support for single file
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
