import { create } from '@web3-storage/w3up-client';

// Ініціалізація клієнта Web3.Storage
const initializeClient = async (spaceDID) => {
  try {
    const client = await create(); // Створення клієнта
    //const space = await client.createSpace('space-for-photo');
    const myAccount = await client.login('nikita.ivakin@nure.ua');
    //const space = await client.getSpace('did:key:z6Mkj2dAAvkEiXtQcxXaDxNG6nYniLRC1vNLZ1yWtGix72ey');
    // Встановлення поточного простору за DID
    /*while (true) {
      const res = await myAccount.plan.get()
      if (res.ok) break
      console.log('Waiting for payment plan to be selected...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }*/
    //await myAccount.provision('did:key:z6MkwaobBZFZWHW9jZTYxdHPVDyJrFpwzohkMGshHJLEFAyY');
    await client.setCurrentSpace(spaceDID);
    //const spaceDID = 'did:key:z6Mkj2dAAvkEiXtQcxXaDxNG6nYniLRC1vNLZ1yWtGix72ey'; // Замініть на ваш DID
    //await myAccount.provision('did:key:z6Mkj2dAAvkEiXtQcxXaDxNG6nYniLRC1vNLZ1yWtGix72ey')
    
    console.log('Поточний простір встановлено:');

    return client;
  } catch (error) {
    console.error('Помилка ініціалізації клієнта:', error);
    throw error;
  }
};

// Завантаження файлу
export const uploadFile = async (file) => {
  try {
    const photoSpaceDID = 'did:key:z6Mkj2dAAvkEiXtQcxXaDxNG6nYniLRC1vNLZ1yWtGix72ey'; // DID для фото
    const client = await initializeClient(photoSpaceDID);
    
    const cid = await client.uploadFile(file);
    console.log('Файл успішно завантажено. CID:', cid);
    return cid;
  } catch (error) {
    console.error('Помилка завантаження файлу:', error);
    throw error;
  }
};

// Завантаження директорії
export const uploadDirectory = async (files) => {
  try {
    const client = await initializeClient();
    const directoryCid = await client.uploadDirectory(files);
    console.log('Директорія успішно завантажена. CID:', directoryCid);
    return directoryCid;
  } catch (error) {
    console.error('Помилка завантаження директорії:', error);
    throw error;
  }
};

// Завантаження JSON на IPFS
export const uploadJSON = async (jsonData) => {
  try {
    const defaultSpaceDID = 'did:key:z6MkuNEG88XgRAXjQDgrfAwUfnPnSEvNXAbFuNNcYkQL13xj'; // DID для JSON
    const client = await initializeClient(defaultSpaceDID);

    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const cid = await client.uploadFile(blob);
    console.log('JSON успішно завантажено. CID:', cid);
    return cid;
  } catch (error) {
    console.error('Помилка завантаження JSON:', error);
    throw error;
  }
};
