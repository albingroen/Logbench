const cn = (...classes: (string | false | undefined)[]): string => classes.filter(Boolean).join(' ')

export default cn
