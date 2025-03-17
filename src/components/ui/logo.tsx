
import { React } from '@/core/ReactInstance';
import { LogoImage } from '@/components/common/LogoImage';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return <LogoImage className={className} />;
};
