import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppV1 from './components/App';
import AppV2 from './components-v2/App';
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
      _active: {
        opacity: '0.5',
        bg: 'brand.blue'
      },
      _hover: {
        opacity: '0.8'
      }
    },
    primaryActionLined: {
      bg: 'transparent',
      borderColor: 'brand.blue',
      borderRadius: '2px',
      borderWidth: '1px',
      color: 'brand.blue',
      transition: 'none',
      _active: {
        opacity: '0.5'
      },
      _hover: {
        // bg: 'white',
        // color: 'brand.blue',
        opacity: '0.8'
      }
    },
    primaryActionInverted: {
      bg: 'transparent',
      borderColor: 'brand.blue',
      borderRadius: '2px',
      color: 'brand.blue',
      transition: 'none',
      _active: {
        opacity: '0.5'
      },
      _hover: {
        bg: 'brand.blue',
        color: 'white'
      }
    },
    secondaryAction: {
      bg: 'brand.turquoise',
      color: 'brand.background',
      borderColor: 'brand.turquoise',
      borderRadius: '2px',
      borderWidth: '1px',
      transition: 'none',
      _active: {
        opacity: '0.5',
        bg: 'brand.turquoise'
      },
      _hover: {
        bg: 'brand.turquoise',
        color: 'brand.background',
        opacity: '0.8'
      }
    },
    secondaryActionLined: {
      bg: 'none',
      borderColor: 'brand.turquoise',
      borderRadius: '2px',
      borderWidth: '1px',
      color: 'brand.turquoise',
      transition: 'none',
      _active: {
        opacity: '0.8',
        bg: 'brand.turquoise'
      },
      _hover: {
        bg: 'brand.turquoise',
        color: 'brand.background'
      }
    },
    cancelAction: {
      bg: 'none',
      borderColor: 'brand.red',
      borderRadius: '2px',
      borderWidth: '1px',
      color: 'brand.red',
      transition: 'none',
      _active: {
        opacity: '0.8',
        bg: 'brand.red'
      },
      _hover: {
        bg: 'brand.red',
        color: 'white'
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
      fontSize: '1rem',
      fontWeight: '600',
      height: 10,
      justifyContent: 'center',
      lineHeight: '1.2',
      paddingX: 4,
      transition: 'none',
      _hover: {
        bg: 'white',
        color: 'brand.blue',
        textDecoration: 'none'
      }
    },
    primaryActionInactive: {
      alignItems: 'center',
      bg: 'gray.600',
      borderRadius: '2px',
      color: 'gray.400',
      display: 'inline-flex',
      fontSize: '1rem',
      fontWeight: '600',
      height: 10,
      justifyContent: 'center',
      lineHeight: '1.2',
      paddingX: 4,
      transition: 'none',
      _hover: {
        color: 'gray.400',
        textDecoration: 'none'
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
      black: '#1D2227',
      background: '#1C2228',
      darkGray: '#3B4650',
      gray: '#AEBBC9',
      lightGray: '#ABBBCB',
      brightGray: '#F2F4F7',
      blue: '#005DFF',
      lightBlue: '#D3DEF5',
      turquoise: '#00FFBE',
      red: '#FF4161'
    }
  },
  components: {
    Button,
    Link,
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '1px',
            _focus: {
              boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
            }
          }
        }
      }
    },
    Textarea: {
      variants: {
        outline: {
          borderRadius: '1px',
          _focus: {
            boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
          }
        }
      }
    }
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

const minterVersion = new URLSearchParams(window.location.search).get('v');

if (minterVersion) {
  localStorage.setItem('minter_version', minterVersion);
}

function Root() {
  if (localStorage.getItem('minter_version') === '1') {
    return <AppV1 />;
  }
  return (
    <ChakraProvider theme={theme}>
      <AppV2 />
    </ChakraProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
