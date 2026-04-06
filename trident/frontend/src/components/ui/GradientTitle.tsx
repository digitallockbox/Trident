import { FC } from 'react';

interface GradientTitleProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GradientTitle: FC<GradientTitleProps> = ({ text, size = 'md' }) => {
  const sizeMap = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <h1 className={`${sizeMap[size]} font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500`}>
      {text}
    </h1>
  );
};

export default GradientTitle;
