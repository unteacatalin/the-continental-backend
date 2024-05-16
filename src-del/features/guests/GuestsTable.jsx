import Empty from '../../ui/Empty';
import Menus from '../../ui/Menus';
import Pagination from '../../ui/Pagination';
import Spinner from '../../ui/Spinner';
import Table from '../../ui/Table';
import GuestRow from './GuestRow';
import { useGuests } from './useGuests';

function GuestsTable() {
  const { guests, isLoading, count } = useGuests();

  if (isLoading) return <Spinner />;

  if (!guests?.length) return <Empty resource='guests' />;

  return (
    <Menus>
      <Table columns='1.5fr 1fr 0.7fr 1fr 0.3fr 3.2rem'>
        <Table.Header>
          <div>Full Name</div>
          <div>Email</div>
          <div>National ID</div>
          <div>Nationality</div>
          <div>Flag</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={guests}
          render={(guest) => <GuestRow key={guest.id} guest={guest} />}
        />
        <Table.Footer>
          <Pagination count={count} />
        </Table.Footer>
      </Table>
    </Menus>
  );
}

export default GuestsTable;
