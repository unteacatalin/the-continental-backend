import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import CreateUpdateBookingForm from './CreateUpdateBookingForm';

function AddBooking() {
  return (
    <Modal>
      <Modal.Open opens='booking-form'>
        <Button size='medium' variation='secondary'>
          Add booking
        </Button>
      </Modal.Open>
      <Modal.Window name='booking-form'>
        <CreateUpdateBookingForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddBooking;
