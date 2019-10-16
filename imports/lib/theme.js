const screen = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
	tablet: '768px',
	tabletL: '992px',
  laptop: '1024px',
	laptopL: '1440px',
	desktop: '1920px',
  desktopL: '2560px'
}

const device = {
  mobileS: `(min-width: ${screen.mobileS})`,
  mobileM: `(min-width: ${screen.mobileM})`,
  mobileL: `(min-width: ${screen.mobileL})`,
  tablet: `(min-width: ${screen.tablet})`,
  tabletL: `(min-width: ${screen.tabletL})`,
  laptop: `(min-width: ${screen.laptop})`,
  laptopL: `(min-width: ${screen.laptopL})`,
  desktop: `(min-width: ${screen.desktop})`,
  desktopL: `(min-width: ${screen.desktopL})`
};

const size = {

}

const mediaQuery = () => {

	return `@media only screen ()`;
}

const theme = {
	media: mediaQuery
};

export default theme;