import PureJudgementPanel2 from '~/components/PureJudgementPanel2';

export default {
  title: 'PureJudgementPanel2',
  component: PureJudgementPanel2,
}

const Template = (args, { argTypes }) => ({
  components: { PureJudgementPanel2 },
  props: Object.keys(argTypes),
  template: `<PureJudgementPanel2 />`,
});

export const empty = Template.bind({});

empty.args = {
};

export const basic = Template.bind({});
basic.args = {
    
};
