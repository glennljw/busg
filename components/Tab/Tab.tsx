import { Button } from '@chakra-ui/react';
import { BusTabs } from '../../types/buses';
import styles from './Tab.module.scss';

interface TabOption {
  id: BusTabs;
  label: string;
}

const tabOptions: TabOption[] = [
  { id: 'names', label: 'Name' },
  { id: 'code', label: 'Number' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'favorites', label: 'Starred' },
];

interface TabProps {
  activeTab: BusTabs;
  setTab: (tabName: BusTabs) => void;
}

const Tab = ({ activeTab, setTab }: TabProps) => {
  return (
    <div className={styles.button_group_container}>
      {tabOptions.map((tab) => (
        <Button
          key={tab.id}
          className={styles.tab_button}
          size="sm"
          rounded="full"
          variant={activeTab === tab.id ? 'solid' : 'outline'}
          colorPalette={activeTab === tab.id ? 'brand' : 'gray'}
          onClick={() => setTab(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default Tab;
