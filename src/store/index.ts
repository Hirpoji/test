import { types, flow, applySnapshot, Instance } from 'mobx-state-tree';
import axios from 'axios';

const Meter = types.model('Meter', {
  id: types.string,
  type: types.string,
  installation_date: types.string,
  is_automatic: types.boolean,
  initial_values: types.number,
  area_id: types.string,
  description: types.string,
  address: types.maybe(types.string),
});

interface Meter {
  id: string;
  _type: string;
  installation_date: string;
  is_automatic: boolean;
  initial_values: Array<string>;
  area: Area;
  description: string;
  address?: string;
}

interface Area {
  id: string;
}

const RootStore = types
  .model('RootStore', {
    meters: types.array(Meter),
    addresses: types.map(types.string),
    limit: 20,
    offset: 0,
    totalCount: 0,
  })
  .actions((self) => {
    const fetchMeters = flow(function* () {
      try {
        const response = yield axios.get(
          'http://showroom.eis24.me/api/v4/test/meters/',
          {
            params: { limit: self.limit, offset: self.offset },
          }
        );

        self.totalCount = response.data.count;

        const metersData = response.data.results.map((meter: Meter) => ({
          id: meter.id,
          type: meter._type[0],
          installation_date: meter.installation_date,
          is_automatic: meter.is_automatic || false,
          initial_values: meter.initial_values[0] || 0,
          area_id: meter.area.id,
          description: meter.description,
          addresses: undefined,
        }));

        applySnapshot(self.meters, metersData);

        const areaIds = self.meters.map((meter) => meter.area_id);

        yield fetchAddresses(areaIds);
      } catch (error) {
        console.error('Не удалось получить счетчики', error);
      }
    });

    const fetchAddresses = flow(function* (areaIds: string[]) {
      try {
        const unknownAreaIds = areaIds.filter((id) => !self.addresses.has(id));
        if (unknownAreaIds.length > 0) {
          for (let id of unknownAreaIds) {
            const response = yield axios.get(
              'http://showroom.eis24.me/api/v4/test/areas/',
              {
                params: { id: id },
              }
            );

            const area = response.data;

            self.addresses.set(
              area.results[0].id,
              area.results[0].house.address
            );
          }
        }

        self.meters.forEach((meter) => {
          meter.address =
            self.addresses.get(meter.area_id) || 'Неизвестный адрес';
        });
      } catch (error) {
        console.error('Не удалось получить адреса', error);
      }
    });

    const deleteMeter = flow(function* (meterId: string) {
      try {
        yield axios.delete(
          `http://showroom.eis24.me/api/v4/test/meters/${meterId}/`
        );
        self.meters.replace(
          self.meters.filter((meter) => meter.id !== meterId)
        );
        if (self.meters.length < self.limit) {
          self.offset = Math.max(self.offset - self.limit, 0);
          yield fetchMeters();
        }
      } catch (error) {
        console.error('Не удалось удалить счетчик', error);
      }
    });

    const changePage = (newOffset: number) => {
      self.offset = newOffset;
      self.fetchMeters();
    };

    return { fetchMeters, deleteMeter, fetchAddresses, changePage };
  })
  .actions((self) => ({
    afterCreate() {
      self.fetchMeters();
    },
  }));

export default RootStore;
export type RootStoreInstance = Instance<typeof RootStore>;
