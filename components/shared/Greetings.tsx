import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

const GreetingComponent = ({email}: {email?: string}) => {
  const { t } = useTranslation();

  return (
    <View style={{ 
      backgroundColor: '#f0f9ff', // bg-blue-50
      borderRadius: 8, 
      padding: 12, 
      marginBottom: 16 
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center' 
      }}>
        <View style={{ 
          backgroundColor: '#DBEAFE', // bg-blue-100 
          borderRadius: 9999, 
          padding: 8, 
          marginRight: 12 
        }}>
          <Svg 
            width={24} 
            height={24} 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="#3B82F6" // text-blue-500
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <Path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </Svg>
        </View>
        <View>
          <Text style={{ 
            color: '#1E40AF', // text-blue-900
            fontWeight: '500',
            marginBottom: 4 
          }}>
            {t('home.hi')} {email}
          </Text>
          <Text style={{ 
            color: '#3B82F6', // text-blue-500
            fontSize: 12 
          }}>
            {t('home.glad')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GreetingComponent;