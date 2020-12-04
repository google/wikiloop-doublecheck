import PureActionPanel2 from '~/components/PureActionPanel2';

export default {
  title: 'PureActionPanel2',
  component: PureActionPanel2,
}

const Template = (args, { argTypes }) => ({
  components: { PureActionPanel2 },
  props: Object.keys(argTypes),
  template: '<PureActionPanel2 />',
});

empty.args = {
  infoLoaded: false
};

export const basic = Template.bind({});
basic.args = {
};
