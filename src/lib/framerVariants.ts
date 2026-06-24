import { Variants, Transition } from 'framer-motion'
export const transition: Transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition },
}
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
}
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition },
}
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition },
}
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition },
}
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
export const cardHover = { whileHover: { y: -4, transition: { duration: 0.3 } } }
export const buttonHover = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } }
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition },
}
