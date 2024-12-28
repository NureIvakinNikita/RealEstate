import { create } from 'ipfs-http-client';

// Налаштування клієнта для підключення до Infura (або іншого провайдера)
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

// Функція для завантаження фото на IPFS
export const uploadImage = async (file) => {
  try {
    // Додаємо файл до IPFS
    const added = await ipfs.add(file);
    console.log('File uploaded to IPFS: ', added.path);
    return added.path;  // Це буде хеш файлу
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Функція для створення метаданих (включає посилання на фото)
export const createMetadata = (imageHash, name, description, price, area, rooms) => {
  return {
    name: name,
    description: description,
    image: `https://ipfs.io/ipfs/${imageHash}`,  // Використовуємо хеш для доступу до фото
    price: price,  // Ціна в ETH
    area: area,  // Площа
    rooms: rooms  // Кількість кімнат
  };
};

// Функція для завантаження метаданих на IPFS
export const uploadMetadata = async (metadata) => {
  try {
    // Додаємо метадані до IPFS
    const added = await ipfs.add(JSON.stringify(metadata));
    console.log('Metadata uploaded to IPFS: ', added.path);
    return added.path;  // Хеш метаданих
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
};

// Приклад використання функцій з async/await
export const uploadPropertyData = async (file, name, description, price, area, rooms) => {
  try {
    // Завантажуємо зображення на IPFS
    const imageHash = await uploadImage(file);

    // Створюємо метадані для нерухомості
    const metadata = createMetadata(imageHash, name, description, price, area, rooms);

    // Завантажуємо метадані на IPFS
    const metadataHash = await uploadMetadata(metadata);

    // Повертаємо хеш метаданих
    console.log('Property metadata uploaded with hash: ', metadataHash);
    return metadataHash;
  } catch (error) {
    console.error('Error uploading property data:', error);
    throw error;
  }
};
