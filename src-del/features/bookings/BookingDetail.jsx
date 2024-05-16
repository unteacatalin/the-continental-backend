import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import BookingDataBox from './BookingDataBox';
import Row from '../../ui/Row';
import Heading from '../../ui/Heading';
import Tag from '../../ui/Tag';
import ButtonGroup from '../../ui/ButtonGroup';
import Button from '../../ui/Button';
import ButtonText from '../../ui/ButtonText';
import Empty from '../../ui/Empty';

import { useMoveBack } from '../../hooks/useMoveBack';
import { useBooking } from './useBooking';
import Spinner from '../../ui/Spinner';
import { useCheckout } from '../check-in-out/useCheckout';
import Modal from '../../ui/Modal';
import { useDeleteBooking } from './useDeleteBooking';
import ConfirmDelete from '../../ui/ConfirmDelete';

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;

function BookingDetail() {
  const { isLoading, booking } = useBooking();
  const { checkout, isCheckingOut } = useCheckout();
  const { deleteBooking, isDeletingBooking } = useDeleteBooking();
  const moveBack = useMoveBack();
  const navigate = useNavigate();

  const statusToTagName = {
    unconfirmed: 'blue',
    'checked-in': 'green',
    'checked-out': 'silver',
  };

  if (isLoading) return <Spinner />;
  if (!booking) return <Empty resource='booking' />;

  const { status, id: bookingId } = booking;

  return (
    <>
      <Modal>
        <Row type='horizontal'>
          <HeadingGroup>
            <Heading as='h1'>Booking #{bookingId}</Heading>
            <Tag type={statusToTagName[status]}>{status.replace('-', ' ')}</Tag>
          </HeadingGroup>
          <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
        </Row>

        <BookingDataBox booking={booking} />

        <ButtonGroup>
          {status === 'unconfirmed' && (
            <>
              <Button onClick={() => navigate(`/checkin/${bookingId}`)}>
                Check in
              </Button>
              <Modal.Open opens='delete'>
                <Button variation='danger'>Delete</Button>
              </Modal.Open>
              <Modal.Window name='delete'>
                <ConfirmDelete
                  resourceName={`Booking #${bookingId}`}
                  onConfirm={() => {
                    deleteBooking(bookingId, {
                      onSettled: () => navigate(-1),
                    });
                  }}
                  disabled={isDeletingBooking}
                />
              </Modal.Window>
            </>
          )}

          {status === 'checked-in' && (
            <Button
              onClick={() => {
                checkout(bookingId);
              }}
              disabled={isCheckingOut}
            >
              <span>Check out</span>
            </Button>
          )}

          <Button variation='secondary' onClick={moveBack}>
            Back
          </Button>
        </ButtonGroup>
      </Modal>
    </>
  );
}

export default BookingDetail;
