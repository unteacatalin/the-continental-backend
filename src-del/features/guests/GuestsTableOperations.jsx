import { useRef } from 'react';

import FilterText from '../../ui/FilterText';
import SortBy from '../../ui/SortBy';
import TableOperations from '../../ui/TableOperations';

function GuestsTableOperations() {
  const refFilterGuestEmail = useRef();
  const refFilterGuestNationalID = useRef();
  return (
    <TableOperations>
      <FilterText
        filterField='email'
        placeholder='email'
        refFilterGuest={refFilterGuestEmail}
      />
      <FilterText
        filterField='nationalID'
        placeholder='nationalID'
        refFilterGuest={refFilterGuestNationalID}
      />
      <SortBy
        options={[
          { value: 'fullName-asc', label: 'Sort by name (ascending)' },
          { value: 'fullName-desc', label: 'Sort by name (descending)' },
          { value: 'email-asc', label: 'Sort by email (ascending)' },
          { value: 'email-desc', label: 'Sort by email (descending)' },
          {
            value: 'nationalID-asc',
            label: 'Sort by nationalID (low first)',
          },
          {
            value: 'nationalID-desc',
            label: 'Sort by nationalID (high first)',
          },
        ]}
      />
    </TableOperations>
  );
}

export default GuestsTableOperations;
