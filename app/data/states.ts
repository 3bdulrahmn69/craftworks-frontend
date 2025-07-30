interface EgyptianState {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  code: string;
}

export const egyptianStates: EgyptianState[] = [
  {
    id: 'cairo',
    name: {
      en: 'Cairo',
      ar: 'القاهرة',
    },
    code: 'CA',
  },
  {
    id: 'alexandria',
    name: {
      en: 'Alexandria',
      ar: 'الإسكندرية',
    },
    code: 'ALX',
  },
  {
    id: 'giza',
    name: {
      en: 'Giza',
      ar: 'الجيزة',
    },
    code: 'GZ',
  },
  {
    id: 'qalyubia',
    name: {
      en: 'Qalyubia',
      ar: 'القليوبية',
    },
    code: 'KB',
  },
  {
    id: 'port-said',
    name: {
      en: 'Port Said',
      ar: 'بورسعيد',
    },
    code: 'PTS',
  },
  {
    id: 'suez',
    name: {
      en: 'Suez',
      ar: 'السويس',
    },
    code: 'SUZ',
  },
  {
    id: 'luxor',
    name: {
      en: 'Luxor',
      ar: 'الأقصر',
    },
    code: 'LX',
  },
  {
    id: 'aswan',
    name: {
      en: 'Aswan',
      ar: 'أسوان',
    },
    code: 'ASN',
  },
  {
    id: 'asyut',
    name: {
      en: 'Asyut',
      ar: 'أسيوط',
    },
    code: 'AST',
  },
  {
    id: 'beheira',
    name: {
      en: 'Beheira',
      ar: 'البحيرة',
    },
    code: 'BH',
  },
  {
    id: 'beni-suef',
    name: {
      en: 'Beni Suef',
      ar: 'بني سويف',
    },
    code: 'BNS',
  },
  {
    id: 'dakahlia',
    name: {
      en: 'Dakahlia',
      ar: 'الدقهلية',
    },
    code: 'DK',
  },
  {
    id: 'damietta',
    name: {
      en: 'Damietta',
      ar: 'دمياط',
    },
    code: 'DT',
  },
  {
    id: 'fayyum',
    name: {
      en: 'Fayyum',
      ar: 'الفيوم',
    },
    code: 'FYM',
  },
  {
    id: 'gharbia',
    name: {
      en: 'Gharbia',
      ar: 'الغربية',
    },
    code: 'GH',
  },
  {
    id: 'ismailia',
    name: {
      en: 'Ismailia',
      ar: 'الإسماعيلية',
    },
    code: 'IS',
  },
  {
    id: 'kafr-el-sheikh',
    name: {
      en: 'Kafr el-Sheikh',
      ar: 'كفر الشيخ',
    },
    code: 'KFS',
  },
  {
    id: 'matrouh',
    name: {
      en: 'Matrouh',
      ar: 'مطروح',
    },
    code: 'MT',
  },
  {
    id: 'minya',
    name: {
      en: 'Minya',
      ar: 'المنيا',
    },
    code: 'MN',
  },
  {
    id: 'monufia',
    name: {
      en: 'Monufia',
      ar: 'المنوفية',
    },
    code: 'MNF',
  },
  {
    id: 'new-valley',
    name: {
      en: 'New Valley',
      ar: 'الوادي الجديد',
    },
    code: 'WAD',
  },
  {
    id: 'north-sinai',
    name: {
      en: 'North Sinai',
      ar: 'شمال سيناء',
    },
    code: 'SIN',
  },
  {
    id: 'qena',
    name: {
      en: 'Qena',
      ar: 'قنا',
    },
    code: 'QNA',
  },
  {
    id: 'red-sea',
    name: {
      en: 'Red Sea',
      ar: 'البحر الأحمر',
    },
    code: 'BA',
  },
  {
    id: 'sharqia',
    name: {
      en: 'Sharqia',
      ar: 'الشرقية',
    },
    code: 'SHR',
  },
  {
    id: 'sohag',
    name: {
      en: 'Sohag',
      ar: 'سوهاج',
    },
    code: 'SHG',
  },
  {
    id: 'south-sinai',
    name: {
      en: 'South Sinai',
      ar: 'جنوب سيناء',
    },
    code: 'JS',
  },
];

// Helper functions
export const getStateById = (id: string): EgyptianState | undefined => {
  return egyptianStates.find((state) => state.id === id);
};

export const getStateByName = (name: string): EgyptianState | undefined => {
  return egyptianStates.find(
    (state) =>
      state.name.en.toLowerCase() === name.toLowerCase() ||
      state.name.ar === name
  );
};

export const getStateNames = (language: 'en' | 'ar' = 'en'): string[] => {
  return egyptianStates.map((state) => state.name[language]);
};

export const getStatesForSelect = (language: 'en' | 'ar' = 'en') => {
  return egyptianStates.map((state) => ({
    value: state.name.en, // Always use English name as value for consistency
    label: state.name[language],
    id: state.id,
  }));
};

// Legacy support - returns just English names as array
export const getEgyptianStatesArray = (): string[] => {
  return egyptianStates.map((state) => state.name.en);
};

export type { EgyptianState };
