import { Screen } from '../layout/screen';
import { LoadingState } from './loading-state';

type FullscreenLoadingProps = {
  message?: string;
};

export function FullscreenLoading({ message }: FullscreenLoadingProps) {
  return (
    <Screen scrollable={false}>
      <LoadingState message={message ?? 'Chargement...'} />
    </Screen>
  );
}
