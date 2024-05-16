import { supabaseUrl } from '../services/supabase';

const imageUrl = `${supabaseUrl}/storage/v1/object/public/room-images/`;

export const rooms = [
  {
    name: '001',
    maxCapacity: 2,
    regularPrice: 350,
    discount: 50,
    image: imageUrl + 'room-001.jpg',
    description:
      '<strong>Double Deluxe Room</string> - provides views over landscaped gardens. It has a seating area, ample storage, digital safe and mini fridge. All our guestrooms are elegantly furnished with handmade furniture include luxury en-suite facilities with complimentary amenities pack, flat screen LCD TV, tea/coffee making facilities, fan, hairdryer and the finest pure white linen and towels.',
  },
  {
    name: '002',
    maxCapacity: 2,
    regularPrice: 220,
    discount: 0,
    image: imageUrl + 'room-002.jpg',
    description:
      '<strong>Double Standard Room</strong> - comprises of 1 Double Bed or 2 Twin Beds, 2 Bedside Tables, a Desk & Chair. The room is furnished with wall to wall carpeting, trendy furnishings and a balcony. Our ultramodern glass bathroom is equipped with hairdryer, magnifying shaving and make up mirror as well as all the amenities you could possible need during your stay. A Complimentary Bottle of Wine, Fresh Fruit and Mineral Water, are provided on arrival. Electric current: 220 Volts. Smoking rooms & inter-connecting rooms are also available.',
  },
  {
    name: '003',
    maxCapacity: 2,
    regularPrice: 300,
    discount: 25,
    image: imageUrl + 'room-003.jpg',
    description:
      '<strong>Double Deluxe Room</strong> - is modern decorated, can accommodate up to 2 persons, totally soundproofed and equipped with high tech comforts such as high speed internet access, USB ports, smart TV, room cleaning touch system and private hydromassage bathtub.',
  },
  {
    name: '004',
    maxCapacity: 3,
    regularPrice: 350,
    discount: 20,
    image: imageUrl + 'room-004.jpg',
    description:
      '<strong>Superior Room</strong> - Spacious, comfortable and freshy renovated guest room. High speed internet access, luxury bedding and comfortable seating area. Well appointed with everything you need for a relaxing or productive stay.',
  },
  {
    name: '005',
    maxCapacity: 2,
    regularPrice: 450,
    discount: 20,
    image: imageUrl + 'room-005.jpg',
    description:
      '<strong>Double Deluxe Room</strong> - The room has a French bed and can accommodate up to 2 guests. It has a separate bathroom, TV, and internet connection.',
  },
  {
    name: '006',
    maxCapacity: 1,
    regularPrice: 250,
    discount: 10,
    image: imageUrl + 'room-006.jpg',
    description:
      '<strong>Double Standard Room</strong> - comfortable air-conditioned Queen Room feature one queen bed, flat-screen color television with 70 premium channels, refrigerator, microwave, hair dryer, iron and ironing board.',
  },
  {
    name: '007',
    maxCapacity: 3,
    regularPrice: 450,
    discount: 0,
    image: imageUrl + 'room-007.jpg',
    description:
      '<strong>Deluxe Studio</strong> - Tailored to multiple guests, spacious room offer luxuriously outfitted Proper beds, living space for working, dining or lounging, marble baths, premium WiFi and Apple TV.',
  },
  {
    name: '008',
    maxCapacity: 3,
    regularPrice: 300,
    discount: 10,
    image: imageUrl + 'room-008.jpg',
    description:
      '<strong>Double Standard Room</strong> - offers queen bed with plush bedding and an oversized rich wood working desk featuring granite bathrooms with rainfall showers',
  },
  {
    name: '009',
    maxCapacity: 2,
    regularPrice: 420,
    discount: 30,
    image: imageUrl + 'room-009.jpg',
    description:
      '<strong>Double Delux Room</strong> - king guest room, include designer furnishings, sophisticated décor and plush bedding. These spacious, residential-style rooms also feature 10-foot floor-to-ceiling windows for natural light — and for taking in all those stunning views.',
  },
];
