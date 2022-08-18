import { Button, ButtonGroup } from '@chakra-ui/react';
import { BusTabs } from '../../types/buses';
import styles from './Tab.module.scss';

interface TabProps {
  setTab: (tabName: BusTabs) => void;
}

const Tab = ({ setTab }: TabProps) => {
  return (
    <div className={styles.button_group_container}>
      <ButtonGroup variant="outline" isAttached spacing={20}>
        <Button
          onClick={() => {
            setTab('names');
          }}
        >
          Stop Name
        </Button>
        <Button
          onClick={() => {
            setTab('code');
          }}
        >
          Stop No.
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default Tab;
