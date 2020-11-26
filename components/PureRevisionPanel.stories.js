import PureRevisionPanel from '~/components/PureRevisionPanel';

export default {
  title: 'PureRevisionPanel',
  component: PureRevisionPanel,
}

const Template = (args, { argTypes }) => ({
  components: { PureRevisionPanel },
  props: Object.keys(argTypes),
  template: '<PureRevisionPanel :infoLoaded="infoLoaded" :item="item" :diffLoaded="diffLoaded" />',
});

export const empty = Template.bind({});

empty.args = {
  infoLoaded: false
};

export const basic = Template.bind({});
basic.args = {
  infoLoaded: true,
  diffLoaded: false,
  item: {
    wiki: "enwiki",
    revId: 989699374,
    title: "Human tooth sharpening",
    timestamp: 1284858, // TODO fix XXX
    author: "2601:5C2:1:5720:A5F4:BA9B:79B8:598C",
    summary: `b hdhe ekjwjk eiqnq /* History */`
  },
};
