import PureJudgementPanel2 from '~/components/PureJudgementPanel2';

export default {
  title: 'PureJudgementPanel2',
  component: PureJudgementPanel2,
};

const Template = (args, { argTypes }) => ({
  components: { PureJudgementPanel2 },
  props: Object.keys(argTypes),
  template: '<PureJudgementPanel2 :interactions="interactions" />',
});

export const empty = Template.bind({});

empty.args = {
};

export const basic = Template.bind({});
basic.args = {
  interactions: [
    { wikiUserName: 'Xinbenlv', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'LooksGood' },
    { wikiUserName: 'Alpha', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'NotSure' },
  ],
};

export const basic2 = Template.bind({});
basic2.args = {
  interactions: [
    { wikiUserName: 'Xinbenlv', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'ShouldRevert' },
    { wikiUserName: 'Alpha', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'NotSure' },
    { wikiUserName: 'Bella', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'ShouldRevert' },
  ],
};

export const dense = Template.bind({});

dense.parameters = {
  // Set the viewports in Chromatic at a component level.
  chromatic: { viewports: [320, 1800] },
};

dense.args = {
  interactions: [
    { wikiUserName: 'Xinbenlv', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'LooksGood' },
    { wikiUserName: 'XinbenlvSandBox', userGaId: 'GA1.2.1021694750.1607134727', judgement: 'LooksGood' },
    { wikiUserName: 'Alpha', userGaId: 'GA1.2.1021694750.1607134827', judgement: 'NotSure' },
    { wikiUserName: 'Bella', userGaId: 'GA1.2.1021694750.160718372', judgement: 'ShouldRevert' },
    { userGaId: 'GA1.2.1021694750.160718144', judgement: 'ShouldRevert' },
    { userGaId: 'GA1.2.1021694750.160718274', judgement: 'ShouldRevert' },
  ],
};
