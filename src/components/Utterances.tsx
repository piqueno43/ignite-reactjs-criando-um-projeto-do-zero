import { useInView } from 'react-intersection-observer';

import { useUtterances } from '../services/hooks/useUtterances';

export const Utterances = () => {
  const COMMENTS_NODE_ID = 'comments';
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: true });

  useUtterances(inView ? COMMENTS_NODE_ID : '');

  return (
    <div ref={ref} className="min-h-[400px]">
      {inView ? <div id={COMMENTS_NODE_ID} /> : null}
    </div>
  );
};
