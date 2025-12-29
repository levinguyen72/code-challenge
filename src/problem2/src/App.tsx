import { useState, useEffect, useRef } from 'react'
import './App.css'
import { API_URL, TOKEN_ICONS_URL } from './constants'

interface PriceData {
  currency: string
  date: string
  price: number
}

interface CurrencyPrice {
  currency: string
  price: number
}

function App() {
  const [prices, setPrices] = useState<CurrencyPrice[]>([])
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [sellCurrency, setSellCurrency] = useState('ETH')
  const [buyCurrency, setBuyCurrency] = useState('')
  const [sellBalance] = useState(2000)
  const [showSellDropdown, setShowSellDropdown] = useState(false)
  const [showBuyDropdown, setShowBuyDropdown] = useState(false)
  const [sellError, setSellError] = useState('')
  const sellAmountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then((data: PriceData[]) => {
        const priceMap = new Map<string, { price: number; date: string }>()
        data?.forEach(item => {
          const existing = priceMap.get(item.currency)
          if (!existing || new Date(item.date) > new Date(existing.date)) {
            priceMap.set(item.currency, { price: item.price, date: item.date })
          }
        })
        const uniquePrices: CurrencyPrice[] = Array.from(priceMap.entries())?.map(([currency, { price }]) => ({
          currency,
          price
        }))
        setPrices(uniquePrices)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (sellAmountRef.current) {
      sellAmountRef.current.focus()
    }
  }, [])

  const getCurrencyPrice = (currency: string): number => {
    const priceData = prices.find(p => p.currency === currency)
    return priceData?.price || 0
  }

  const calculateBuyAmount = (sell: string, sellCurr: string, buyCurr: string) => {
    const sellPrice = getCurrencyPrice(sellCurr)
    const buyPrice = getCurrencyPrice(buyCurr)
    if (!sellPrice || !buyPrice || !sell) return ''
    const amount = (parseFloat(sell) * sellPrice) / buyPrice
    return amount.toFixed(6).replace(/\.?0+$/, '')
  }

  const calculateSellAmount = (buy: string, sellCurr: string, buyCurr: string) => {
    const sellPrice = getCurrencyPrice(sellCurr)
    const buyPrice = getCurrencyPrice(buyCurr)
    if (!sellPrice || !buyPrice || !buy) return ''
    const amount = (parseFloat(buy) * buyPrice) / sellPrice
    return amount.toFixed(6).replace(/\.?0+$/, '')
  }

  const getUSDValue = (amount: string, currency: string): string => {
    if (!amount || !currency) return '$0.00'
    const price = getCurrencyPrice(currency)
    if (!price) return '$0.00'
    const value = parseFloat(amount) * price
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const validateSellAmount = (value: string): string => {
    if (!value || value === '') return ''
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      return 'Amount must be greater than 0'
    }
    if (numValue > selectedSellCurrencyBalance) {
      const formattedBalance = selectedSellCurrencyBalance > 0 
        ? selectedSellCurrencyBalance.toFixed(6).replace(/\.?0+$/, '') 
        : '0'
      return `Insufficient balance. You have ${formattedBalance} ${sellCurrency}`
    }
    return ''
  }

  const handleSellAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSellAmount(value)
      const error = validateSellAmount(value)
      setSellError(error)
      if (value && !error) {
        const calculated = calculateBuyAmount(value, sellCurrency, buyCurrency)
        setBuyAmount(calculated)
      } else {
        setBuyAmount('')
      }
    }
  }

  const handleBuyAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBuyAmount(value)
      if (value) {
        const calculated = calculateSellAmount(value, sellCurrency, buyCurrency)
        setSellAmount(calculated)
        const error = validateSellAmount(calculated)
        setSellError(error)
      } else {
        setSellAmount('')
        setSellError('')
      }
    }
  }

  const handleMaxClick = () => {
    setSellAmount(selectedSellCurrencyBalance.toString())
    setSellError('')
    const calculated = calculateBuyAmount(selectedSellCurrencyBalance.toString(), sellCurrency, buyCurrency)
    setBuyAmount(calculated)
  }

  const swapCurrencies = () => {
    const tempCurrency = sellCurrency
    setSellCurrency(buyCurrency)
    setBuyCurrency(tempCurrency)
    setSellAmount('')
    setBuyAmount('')
    setSellError('')
  }

  const handleSellCurrencySelect = (currency: string) => {
    if (currency === buyCurrency) {
      setBuyCurrency(sellCurrency)
    }
    const newSellCurrency = currency
    setSellCurrency(newSellCurrency)
    setShowSellDropdown(false)
    if (sellAmount) {
      const error = validateSellAmount(sellAmount)
      setSellError(error)
      if (!error) {
        const calculated = calculateBuyAmount(sellAmount, newSellCurrency, buyCurrency)
        setBuyAmount(calculated)
      }
    }
  }

  const handleBuyCurrencySelect = (currency: string) => {
    if (currency === sellCurrency) {
      setSellCurrency(buyCurrency)
    }
    const newBuyCurrency = currency
    setBuyCurrency(newBuyCurrency)
    setShowBuyDropdown(false)
    if (sellAmount) {
      const calculated = calculateBuyAmount(sellAmount, sellCurrency, newBuyCurrency)
      setBuyAmount(calculated)
    }
  }

  const getExchangeRate = (): string => {
    const sellPrice = getCurrencyPrice(sellCurrency)
    const buyPrice = getCurrencyPrice(buyCurrency)
    if (!sellPrice || !buyPrice) return ''
    const rate = sellPrice / buyPrice
    return `1 ${sellCurrency} = ${rate.toFixed(7)} ${buyCurrency} (${getUSDValue('1', sellCurrency)}) | ${getUSDValue('1', buyCurrency)}`
  }

  const availableCurrencies = prices.map(p => p.currency).sort()

  const getSelectedSellCurrencyBalance = () => {
    const priceData = prices?.find(p => p?.currency === sellCurrency)
    const sellPrice = priceData?.price || 0
    if (sellPrice && sellPrice > 0) {
      return sellBalance / sellPrice
    }
    return 0
  }

  const selectedSellCurrencyBalance = getSelectedSellCurrencyBalance()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.currency-selector-wrapper')) {
        setShowSellDropdown(false)
        setShowBuyDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="app">
      <div className="header">
        <nav className="nav-tabs">
          <button className="nav-tab active">Swap Tokens</button>
        </nav>
      </div>
      <div className="usdt-balance">
          Balance: {sellBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
        </div> 

      <div className="swap-card">
        <div className="swap-section">
          <div className="section-label">Sell</div>
          <div className="section-content">
            <div className="amount-section">
              <input
                type="text"
                ref={sellAmountRef}
                className={`amount-input ${sellError ? 'error' : ''}`}
                value={sellAmount}
                onChange={(e) => handleSellAmountChange(e.target.value)}
                placeholder="0"
              />
              {sellError ? (
                <div className="error-message">{sellError}</div>
              ) : (
                <div className="usd-value">{getUSDValue(sellAmount, sellCurrency)}</div>
              )}
            </div>
            <div className="currency-section">
              <div className="currency-selector-wrapper">
                <button className="currency-selector" onClick={() => setShowSellDropdown(!showSellDropdown)}>
                  <img
                    src={`${TOKEN_ICONS_URL}/${sellCurrency}.svg`}
                    alt={sellCurrency}
                    className="currency-icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="currency-name">{sellCurrency}</span>
                  <svg className="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showSellDropdown && (
                  <div className="currency-dropdown">
                    {availableCurrencies?.map(currency => (
                      <button
                        key={currency}
                        className={`dropdown-item ${currency === sellCurrency ? 'active' : ''}`}
                        onClick={() => handleSellCurrencySelect(currency)}
                      >
                        <img
                          src={`${TOKEN_ICONS_URL}/${currency}.svg`}
                          alt={currency}
                          className="dropdown-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span>{currency}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="balance-info">
                <span className="balance">
                  {selectedSellCurrencyBalance > 0 
                    ? selectedSellCurrencyBalance.toFixed(6).replace(/\.?0+$/, '') 
                    : '0'} {sellCurrency}
                </span>
                <button className="max-button" onClick={handleMaxClick}>Max</button>
              </div>
            </div>
          </div>
      </div>

        <button className="swap-direction" onClick={swapCurrencies}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="swap-section">
          <div className="section-label">Buy</div>
          <div className="section-content">
            <div className="amount-section">
              <input
                type="text"
                className="amount-input"
                value={buyAmount}
                onChange={(e) => handleBuyAmountChange(e.target.value)}
                placeholder="0"
              />
              <div className="usd-value">{getUSDValue(buyAmount, buyCurrency)}</div>
            </div>
            <div className="currency-section">
              <div className="currency-selector-wrapper">
                <button className="currency-selector" onClick={() => setShowBuyDropdown(!showBuyDropdown)}>
                  {buyCurrency && (
                    <img
                      src={`${TOKEN_ICONS_URL}/${buyCurrency}.svg`}
                      alt={buyCurrency}
                      className="currency-icon"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <span className="currency-name">{buyCurrency || 'Select token'}</span>
                  <svg className="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showBuyDropdown && (
                  <div className="currency-dropdown">
                    {availableCurrencies?.map(currency => (
                      <button
                        key={currency}
                        className={`dropdown-item ${currency === buyCurrency ? 'active' : ''}`}
                        onClick={() => handleBuyCurrencySelect(currency)}
                      >
                        <img
                          src={`${TOKEN_ICONS_URL}/${currency}.svg`}
                          alt={currency}
                          className="dropdown-icon"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span>{currency}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="swap-button" disabled={!!sellError || !sellAmount || !buyAmount}>Swap</button>

      {getExchangeRate() && (
        <div className="exchange-rate">
          {getExchangeRate()}
        </div>
      )}
    </div>
  )
}

export default App
