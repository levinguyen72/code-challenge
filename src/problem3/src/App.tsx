// Component 1 (TemplateWalletPage): list out all error and non-optimal code in the code block below
// Component 2 (WalletPage): refactored version of the code block 
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

//component 1 (TemplateWalletPage): list out all error and non-optimal code in the code block below
const TemplateWalletPage: React.FC<Props> = (props: Props) => {
  // children doesnot exist on type of Props
  const { children, ...rest } = props;
  // not import useWalletBalances and usePrices yet
  const balances = useWalletBalances();
  const prices = usePrices();

  // unused function
    const getPriority = (blockchain: any): number => {
      switch (blockchain) {
        case 'Osmosis':
          return 100
        case 'Ethereum':
          return 50
        case 'Arbitrum':
          return 30
        case 'Zilliqa':
          return 20
        case 'Neo':
          return 20
        default:
          return -99
      }
    }

  const sortedBalances = useMemo(() => { // not import useMemo yet
    return balances.filter((balance: WalletBalance) => {
          const balancePriority = getPriority(balance.blockchain); // missing blockchain in WalletBalance interface
          if (lhsPriority > -99) { // lhsPriority is not defined
             if (balance.amount <= 0) {
               return true; // return true if balance is less than 0
             }
          }
          return false // return false if balance is greater than 0
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain); // missing blockchain in WalletBalance interface
          const rightPriority = getPriority(rhs.blockchain); // missing blockchain in WalletBalance interface
          if (leftPriority > rightPriority) { 
            return -1; 
          } else if (rightPriority > leftPriority) { 
            return 1;
          }
        // sort function doesn't return 0 when priorities are equal, 
        // not return when priorities are equal
    });
  }, [balances, prices]);

  // unused function
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow // not import WalletRow yet
        className={classes.row}
        //key={index} is used instead of a stable unique identifier
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}


/* Component 2 (WalletPage): refactored version of the code block below */
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      });
  }, [balances]);

  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const formattedAmount = balance.amount.toFixed();
      const usdValue = prices[balance.currency] * balance.amount;
      
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      );
    });
  }, [sortedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage
