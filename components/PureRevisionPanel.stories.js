import PureRevisionPanel from '~/components/PureRevisionPanel';

export default {
  title: 'PureRevisionPanel',
  component: PureRevisionPanel,
}

const Template = (args, { argTypes }) => ({
  components: { PureRevisionPanel },
  props: Object.keys(argTypes),
  template: '<PureRevisionPanel :loading="loading" :item="item" :loadingDiff="loadingDiff" />',
});

export const empty = Template.bind({});

empty.args = {
  loading: true
};

export const basic = Template.bind({});
basic.args = {
  loading: false,
  item: {
    wiki: "enwiki",
    revId: 989699374,
    title: "Human tooth sharpening",
    timestamp: 1284858, // TODO fix XXX
    author: "2601:5C2:1:5720:A5F4:BA9B:79B8:598C",
    summary: `b hdhe ekjwjk eiqnq /* History */`
  },
  loadingDiff: true
};
