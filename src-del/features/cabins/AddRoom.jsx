import Button from '../../ui/Button';
import CreateCabinForm from './CreateCabinForm';
import Modal from '../../ui/Modal';

function AddRoom() {
  return (
    <Modal>
      <Modal.Open opens='room-form'>
        <Button size='medium' variation='secondary'>
          Add room
        </Button>
      </Modal.Open>
      <Modal.Window name='room-form'>
        <CreateCabinForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddRoom;
