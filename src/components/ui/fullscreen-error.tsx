import { Screen } from '../layout/screen';
import { EmptyState } from './empty-state';
import { Button } from './button';

type FullscreenErrorProps = {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function FullscreenError({
  title,
  message,
  retryLabel = 'Reessayer',
  onRetry,
}: FullscreenErrorProps) {
  return (
    <Screen scrollable={false}>
      <EmptyState title={title} message={message} emoji="!" />
      {onRetry ? <Button label={retryLabel} onPress={onRetry} /> : null}
    </Screen>
  );
}
