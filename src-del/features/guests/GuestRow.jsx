import { HiPencil, HiSquare2Stack, HiTrash } from 'react-icons/hi2';

import Table from '../../ui/Table';
import { Flag } from '../../ui/Flag';
import Menus from '../../ui/Menus';
import Modal from '../../ui/Modal';
import CreateGuestForm from './CreateGuestForm';
import ConfirmDelete from '../../ui/ConfirmDelete';
import { useCreateGuest } from './useCreateGuest';
import { useDeleteGuest } from './useDeleteGuest';

function GuestRow({ guest }) {
  const { isDeleting, deleteGuest } = useDeleteGuest();
  const { isCreating, createGuest } = useCreateGuest();

  const {
    id: guestId,
    fullName,
    email,
    nationalID,
    nationality,
    countryFlag,
  } = guest;

  function handleDuplicate() {
    createGuest({
      fullName: `Copy of ${fullName}`,
      email,
      nationalID,
      nationality,
      countryFlag,
    });
  }

  return (
    <Table.Row role='row'>
      <div>{fullName}</div>
      <div>{email}</div>
      <div>{nationalID}</div>
      <div>{nationality}</div>
      <Flag src={countryFlag} alt={`Flag of ${nationality}`} />
      <div>
        <Modal>
          <Menus.Menu>
            <Menus.Toggle id={guestId} />
            <Menus.List id={guestId}>
              <Menus.Button
                icon={<HiSquare2Stack />}
                onClick={handleDuplicate}
                disabled={isCreating}
              >
                Duplicate
              </Menus.Button>
              <Modal.Open opens='edit'>
                <Menus.Button icon={<HiPencil />}>Edit</Menus.Button>
              </Modal.Open>
              <Modal.Open opens='delete'>
                <Menus.Button icon={<HiTrash />}>Delete</Menus.Button>
              </Modal.Open>
            </Menus.List>
            <Modal.Window name='edit'>
              <CreateGuestForm guestToEdit={guest} />
            </Modal.Window>
            <Modal.Window name='delete'>
              <ConfirmDelete
                resourceName={`Guest ${fullName}`}
                onConfirm={() => deleteGuest(guestId)}
                disabled={isDeleting}
              />
            </Modal.Window>
          </Menus.Menu>
        </Modal>
      </div>
    </Table.Row>
  );
}

export default GuestRow;
