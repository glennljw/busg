import { Button, ButtonGroup, Input } from '@chakra-ui/react';
import { BusTabs } from '../../types/buses';

interface TabProps {
  setTab: (tabName: BusTabs) => void;
}

const Tab = ({ setTab }: TabProps) => {
  return (
    <div>
      <ButtonGroup variant="outlined" isAttached>
        <Button
          onClick={() => {
            setTab('names');
          }}
        >
          Stop name
        </Button>
        <Button
          onClick={() => {
            setTab('code');
          }}
        >
          Stop no.
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default Tab;
