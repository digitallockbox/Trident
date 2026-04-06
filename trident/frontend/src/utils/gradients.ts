export const gradients = {
  primary: 'from-cyan-400 to-purple-500',
  success: 'from-emerald-400 to-cyan-500',
  warning: 'from-yellow-400 to-orange-500',
  danger: 'from-rose-400 to-red-500',
  info: 'from-blue-400 to-indigo-500',
};

export const getGradient = (type: keyof typeof gradients): string => {
  return gradients[type];
};
