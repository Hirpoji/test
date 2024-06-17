import styles from './table.module.css';
import ColdWaterIcon from '../icons/ColdWaterIcon';
import HotWaterIcon from '../icons/HotWaterIcon';
import { observer } from 'mobx-react-lite';
import Trash from '../icons/Trash';
import useStore from '../../hooks/useStore';
import { useState } from 'react';

const Table = ({ data }: { data: any[] }) => {
  const store = useStore();
  const totalPages = Math.ceil(store.totalCount / store.limit);
  const currentPage = store.offset / store.limit;

  const handlePageChange = (newOffset: number) => {
    store.changePage(newOffset);
  };

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    setHoveredRow(id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    buttons.push(
      <button
        key={0}
        className={`${styles.pagination__button} ${
          currentPage === 0 ? styles.active : ''
        }`}
        onClick={() => handlePageChange(0)}
      >
        1
      </button>
    );

    if (startPage > 1) {
      buttons.push(<button className={styles.pagination__button}>...</button>);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i > 0 && i < totalPages - 1) {
        buttons.push(
          <button
            key={i}
            className={`${styles.pagination__button} ${
              currentPage === i ? styles.active : ''
            }`}
            onClick={() => handlePageChange(i * store.limit)}
          >
            {i + 1}
          </button>
        );
      }
    }

    if (endPage < totalPages - 2) {
      buttons.push(
        <button key="end-ellipsis" className={styles.pagination__button}>
          ...
        </button>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages - 1}
          className={`${styles.pagination__button} ${
            currentPage === totalPages - 1 ? styles.active : ''
          }`}
          onClick={() => handlePageChange((totalPages - 1) * store.limit)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Тип</th>
            <th>Дата установки</th>
            <th>Автоматизированный</th>
            <th>Текущие показания</th>
            <th>Адрес</th>
            <th>Примечание</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((meter, index) => (
            <tr
              key={meter.id}
              onMouseEnter={() => handleMouseEnter(meter.id)}
              onMouseLeave={handleMouseLeave}
            >
              <td>{index + 1 + store.offset}</td>
              <td>
                {meter.type === 'ColdWaterAreaMeter' ? (
                  <div className={styles.type}>
                    <ColdWaterIcon />
                    ХВС
                  </div>
                ) : (
                  <div className={styles.type}>
                    <HotWaterIcon />
                    ГВС
                  </div>
                )}
              </td>
              <td>
                {new Date(meter.installation_date).toLocaleDateString('ru-RU')}
              </td>
              <td>{meter.is_automatic ? 'да' : 'нет'}</td>
              <td>{meter.initial_values}</td>
              <td>{meter.address}</td>
              <td>{meter.description}</td>
              <td>
                {hoveredRow === meter.id && (
                  <button
                    className={styles.delete}
                    onClick={() => store.deleteMeter(meter.id)}
                  >
                    <Trash />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <div className={styles.pagination__list}>
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
};

export default observer(Table);
