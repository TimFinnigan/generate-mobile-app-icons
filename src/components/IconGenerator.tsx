import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Stack,
  Text,
  Button,
  Progress,
  Heading,
  Container,
  Grid,
  Image,
  useToast,
  Link,
  Flex,
  ButtonGroup,
} from '@chakra-ui/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface IconSize {
  size: number;
  scales: number[];
  name: string;
}

const iosSizes: IconSize[] = [
  { size: 20, scales: [1, 2, 3], name: 'Notification icon' },
  { size: 29, scales: [1, 2, 3], name: 'Settings icon' },
  { size: 40, scales: [1, 2, 3], name: 'Spotlight icon' },
  { size: 60, scales: [2, 3], name: 'App icon' },
  { size: 76, scales: [1, 2], name: 'iPad App icon' },
  { size: 83.5, scales: [2], name: 'iPad Pro App icon' },
  { size: 1024, scales: [1], name: 'App Store icon' },
];

export const IconGenerator = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedIcons, setGeneratedIcons] = useState<{ name: string, url: string }[]>([]);
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceImage(reader.result as string);
        toast({
          title: 'Image loaded',
          description: 'Your image has been loaded successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const resizeImage = (img: HTMLImageElement, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve('');
        return;
      }

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    });
  };

  const generateIcons = async () => {
    if (!sourceImage || !canvasRef.current) return;

    setIsGenerating(true);
    setProgress(0);
    setGeneratedIcons([]);

    try {
      const img = document.createElement('img');
      img.src = sourceImage;
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load the image'));
      });

      const icons: { name: string, url: string }[] = [];
      let completed = 0;
      const total = iosSizes.reduce((acc, { scales }) => acc + scales.length, 0);

      for (const { size, scales, name } of iosSizes) {
        for (const scale of scales) {
          const pixelSize = Math.round(size * scale);
          const iconName = `${name} ${size}x${size}@${scale}x`;
          
          const resizedImageUrl = await resizeImage(img, pixelSize);
          if (resizedImageUrl) {
            icons.push({ name: iconName, url: resizedImageUrl });
          }
          
          completed++;
          setProgress((completed / total) * 100);
        }
      }

      // Generate adaptive icon for Android
      const adaptiveIconUrl = await resizeImage(img, 1024);
      if (adaptiveIconUrl) {
        icons.push({ name: 'Android Adaptive Icon (1024x1024)', url: adaptiveIconUrl });
      }

      // Generate splash icon
      const splashIconUrl = await resizeImage(img, 200);
      if (splashIconUrl) {
        icons.push({ name: 'Splash Icon (200x200)', url: splashIconUrl });
      }

      setGeneratedIcons(icons);

      toast({
        title: 'Success!',
        description: 'All icons have been generated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Icon generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate icons. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadIcon = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllIcons = () => {
    generatedIcons.forEach(({ name, url }) => {
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      downloadIcon(url, sanitizedName);
    });
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  const downloadAsZip = async () => {
    if (generatedIcons.length === 0) return;

    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      const iconsFolder = zip.folder('app-icons');
      
      if (iconsFolder) {
        // Add all icons to the zip file
        generatedIcons.forEach(({ name, url }) => {
          const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
          const blob = dataURLtoBlob(url);
          iconsFolder.file(`${sanitizedName}.png`, blob);
        });
        
        // Generate the zip file
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Save the zip file
        saveAs(content, 'app-icons.zip');
        
        toast({
          title: 'Download Complete',
          description: 'Your icons have been downloaded as a ZIP file.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not create ZIP file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Heading>Mobile App Icon Generator</Heading>
        
        <Box
          {...getRootProps()}
          w="100%"
          h="200px"
          border="2px dashed"
          borderColor={isDragActive ? 'blue.500' : 'gray.300'}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          _hover={{ borderColor: 'blue.500' }}
          bg={isDragActive ? 'blue.50' : 'transparent'}
        >
          <input {...getInputProps()} />
          <Text fontSize="lg">
            {isDragActive
              ? 'Drop the image here...'
              : 'Drag and drop an image here, or click to select'}
          </Text>
        </Box>

        {sourceImage && (
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} w="100%">
            <Box>
              <Text fontWeight="bold" mb={2}>Source Image:</Text>
              <Image
                src={sourceImage}
                alt="Source"
                maxH="200px"
                objectFit="contain"
                borderRadius="md"
              />
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Preview:</Text>
              <Image
                src={sourceImage}
                alt="Preview"
                maxH="200px"
                objectFit="contain"
                borderRadius="md"
                filter="drop-shadow(0 0 10px rgba(0,0,0,0.2))"
              />
            </Box>
          </Grid>
        )}

        {sourceImage && (
          <Button
            colorScheme="blue"
            onClick={generateIcons}
            isLoading={isGenerating}
            loadingText="Generating Icons..."
          >
            Generate Icons
          </Button>
        )}

        {isGenerating && (
          <Box w="100%">
            <Progress value={progress} size="sm" colorScheme="blue" />
            <Text mt={2} textAlign="center">
              Generating icons... {Math.round(progress)}%
            </Text>
          </Box>
        )}

        {generatedIcons.length > 0 && (
          <Box>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Generated Icons</Heading>
              <ButtonGroup>
                <Button 
                  colorScheme="green" 
                  onClick={downloadAllIcons}
                >
                  Download All
                </Button>
                <Button 
                  colorScheme="teal" 
                  onClick={downloadAsZip}
                  isLoading={isDownloading}
                  loadingText="Creating ZIP..."
                >
                  Download as ZIP
                </Button>
              </ButtonGroup>
            </Flex>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={4}>
              {generatedIcons.map((icon, index) => (
                <Box 
                  key={index} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md"
                  _hover={{ shadow: 'md' }}
                >
                  <Image 
                    src={icon.url} 
                    alt={icon.name}
                    mx="auto"
                    mb={2}
                    boxSize="100px"
                    objectFit="contain"
                  />
                  <Text fontSize="sm" textAlign="center" mb={2}>{icon.name}</Text>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    width="full"
                    onClick={() => downloadIcon(icon.url, icon.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase())}
                  >
                    Download
                  </Button>
                </Box>
              ))}
            </Grid>
          </Box>
        )}

        {/* Hidden canvas for image processing */}
        <Box display="none">
          <canvas ref={canvasRef}></canvas>
        </Box>
      </Stack>
    </Container>
  );
}; 