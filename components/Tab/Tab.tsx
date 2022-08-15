import { Button, ButtonGroup, Input } from '@chakra-ui/react';
import { BusPages } from '../../types/buses';

interface TabProps {
  setPage: (pageName: BusPages) => void;
}

const Tab = ({ setPage }: TabProps) => {
  return (
    <div>
      <ButtonGroup variant="outlined" isAttached>
        <Button
          onClick={() => {
            setPage('names');
          }}
        >
          Stop name
        </Button>
        <Button
          onClick={() => {
            setPage('code');
          }}
        >
          Stop no.
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default Tab;
