import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './components/App';
import App from './components-v2/App';
import * as serviceWorker from './serviceWorker';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const Button = {
  variants: {
    primaryAction: {
      bg: 'brand.blue',
      borderColor: 'brand.blue',
      borderRadius: '2px',
      color: 'white',
      transition: 'none',
      _hover: {
        // bg: 'white',
        // color: 'brand.blue',
        // textDecoration: 'none'
      }
    },
    secondaryAction: {
      bg: 'brand.background',
      borderColor: 'brand.turquoise',
      borderRadius: '2px',
      borderWidth: '1px',
      color: 'brand.turquoise',
      flex: '1',
      _hover: {
        bg: 'brand.turquoise',
        color: 'brand.background'
      }
    }
  }
};

const Link = {
  variants: {
    primaryAction: {
      alignItems: 'center',
      bg: 'brand.blue',
      borderColor: 'brand.blue',
      borderRadius: '2px',
      color: 'white',
      display: 'inline-flex',
      fontWeight: '600',
      height: 10,
      justifyContent: 'center',
      lineHeight: '1.2',
      marginLeft: 4,
      paddingX: 4,
      transition: 'none',
      _hover: {
        // bg: 'white',
        // color: 'brand.blue',
        // textDecoration: 'none'
      }
    }
  }
};

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        height: '100%'
      }
    }
  },
  colors: {
    brand: {
      background: '#1C2228',
      darkGray: '#3B4650',
      lightGray: '#ABBBCB',
      blue: '#005DFF',
      turquoise: '#00FFBE'
    }
  },
  components: {
    Button,
    Link
  },
  fonts: {
    body: "'Roboto', sans-serif",
    heading: "'Roboto', sans-serif",
    mono: "'Roboto Mono', monospace"
  },
  fontWeights: {
    normal: 400,
    bold: 700
  }
});

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
