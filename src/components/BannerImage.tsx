import React from 'react';
import Image from 'next/image';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/system';

interface BannerImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const BannerImageWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(2.5),
  marginBottom: theme.spacing(2.5),
  paddingBottom: theme.spacing(2.5),
}));

const BannerImage: React.FC<BannerImageProps> = ({ src, alt, width = 300, height = 200 }) => {
  return (
    <BannerImageWrapper>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
      />
    </BannerImageWrapper>
  );
};

export default BannerImage;