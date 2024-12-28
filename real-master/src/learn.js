// Дані про об'єкти нерухомості
const properties = [
    {
      id: 1,
      name: "Luxury NYC Penthouse",
      price: 20,
      bedrooms: 2,
      bathrooms: 3,
      squareFeet: 2200,
      yearBuilt: 2013,
    },
    {
      id: 2,
      name: "Modern Loft",
      price: 10,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 800,
      yearBuilt: 2018,
    },
    {
      id: 3,
      name: "Family Home",
      price: 15,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      yearBuilt: 2005,
    },
    {
      id: 4,
      name: "Beachfront Condo",
      price: 25,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      yearBuilt: 2015,
    },
  ];
  
  // Історія переглядів користувача (ідентифікатори об'єктів)
  const userHistory = [1, 3];
  
  // Функція для нормалізації значень (від 0 до 1)
  function normalizeProperties(properties) {
    const normalized = properties.map((property) => ({
      ...property,
      price: property.price / 25, 
      bedrooms: property.bedrooms / 3, 
      bathrooms: property.bathrooms / 3, 
      squareFeet: property.squareFeet / 2200, 
      yearBuilt: (property.yearBuilt - 2000) / 18, 
    }));
    return normalized;
  }
  
  // Косинусна схожість
  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Отримуємо схожі об'єкти
  function getRecommendations(userHistory, properties) {
    // Нормалізуємо дані
    const normalizedProperties = normalizeProperties(properties);
  
    // Створюємо профіль користувача на основі переглядів
    const userProfile = normalizedProperties
      .filter((p) => userHistory.includes(p.id))
      .reduce(
        (acc, property) => ({
          price: acc.price + property.price,
          bedrooms: acc.bedrooms + property.bedrooms,
          bathrooms: acc.bathrooms + property.bathrooms,
          squareFeet: acc.squareFeet + property.squareFeet,
          yearBuilt: acc.yearBuilt + property.yearBuilt,
        }),
        { price: 0, bedrooms: 0, bathrooms: 0, squareFeet: 0, yearBuilt: 0 }
      );
  
    // Середній профіль користувача
    const userProfileAvg = {
      price: userProfile.price / userHistory.length,
      bedrooms: userProfile.bedrooms / userHistory.length,
      bathrooms: userProfile.bathrooms / userHistory.length,
      squareFeet: userProfile.squareFeet / userHistory.length,
      yearBuilt: userProfile.yearBuilt / userHistory.length,
    };
  
    // Перетворюємо профіль у вектор
    const userVector = Object.values(userProfileAvg);
  
    // Рахуємо схожість для кожного об'єкта
    const recommendations = normalizedProperties
      .filter((p) => !userHistory.includes(p.id)) // Відфільтровуємо переглянуті об'єкти
      .map((property) => {
        const propertyVector = [
          property.price,
          property.bedrooms,
          property.bathrooms,
          property.squareFeet,
          property.yearBuilt,
        ];
        const similarity = cosineSimilarity(userVector, propertyVector);
        return { ...property, similarity };
      });
  
    // Сортуємо за схожістю
    recommendations.sort((a, b) => b.similarity - a.similarity);
  
    return recommendations;
  }
  
  // Виводимо рекомендації
  const recommendations = getRecommendations(userHistory, properties);
  console.log("Recommended properties:", recommendations);
  