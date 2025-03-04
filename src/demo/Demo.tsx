
import { DemoProvider } from './DemoContext';
import { DemoLayout } from './layout/DemoLayout';
import { IntroStage } from './stages/IntroStage';
import { AuthStage } from './stages/AuthStage';
import { ConfigStage } from './stages/ConfigStage';
import { IndexingStage } from './stages/IndexingStage';
import { ChatStage } from './stages/ChatStage';
import { ConclusionStage } from './stages/ConclusionStage';
import { useDemo } from './DemoContext';

const DemoContent = () => {
  const { currentStage } = useDemo();

  switch (currentStage) {
    case 'intro':
      return <IntroStage />;
    case 'auth':
      return <AuthStage />;
    case 'config':
      return <ConfigStage />;
    case 'indexing':
      return <IndexingStage />;
    case 'chat':
      return <ChatStage />;
    case 'conclusion':
      return <ConclusionStage />;
    default:
      return <IntroStage />;
  }
};

const Demo = () => {
  return (
    <DemoProvider>
      <DemoLayout>
        <DemoContent />
      </DemoLayout>
    </DemoProvider>
  );
};

export default Demo;
