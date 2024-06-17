import './App.css';
import Table from './components/Table';
import useStore from './hooks/useStore';
import { observer } from 'mobx-react-lite';

function App() {
  const { meters } = useStore();

  return (
    <>
      <div className="container">
        <h1>Список счётчиков</h1>
        <Table data={meters.toJSON()} />
      </div>
    </>
  );
}

export default observer(App);
