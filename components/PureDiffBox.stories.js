import PureDiffBox from '@/components/PureDiffBox';

export default {
  title: 'PureDiffBox',
  component: PureDiffBox,
}

const Template = (args, { argTypes }) => ({
  components: { PureDiffBox },
  props: Object.keys(argTypes),
  template: '<PureDiffBox :diffSafeHtml="inputDiffHtml" />',
});


export const empty = Template.bind({});
empty.args = {
  inputDiffHtml: ``,
};

export const basic = Template.bind({});
basic.args = {
  inputDiffHtml: `<tr>
  <td colspan="2" class="diff-lineno">Line 32:</td>
  <td colspan="2" class="diff-lineno">Line 32:</td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>{{Tibetan Buddhism}}</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>{{Tibetan Buddhism}}</div></td>
</tr>
<tr>
  <td class="diff-marker">−</td>
  <td class="diff-deletedline"><div>'''Dzogchen Monastery''' (Tib. རྫོགས་ཆེན་དགོན། ''rdzogs chen dgon'') is one of the<del class="diffchange diffchange-inline"> six great</del> [[<del class="diffchange diffchange-inline">monastery</del>|<del class="diffchange diffchange-inline">monasteries</del>]] of the [[Nyingma]] tradition of [[Tibetan Buddhism]]. It is located in [[Kham]] within modern day [[Dêgê County]], [[Garzê Tibetan Autonomous Prefecture]], [[Sichuan]], [[China]].</div></td>
  <td class="diff-marker">+</td>
  <td class="diff-addedline"><div>'''Dzogchen Monastery''' (Tib. རྫོགས་ཆེན་དགོན། ''rdzogs chen dgon'') is one of the [[<ins class="diffchange diffchange-inline">Nyingma#"Six Mother Monasteries"</ins>|<ins class="diffchange diffchange-inline">"Six Mother Monasteries"</ins>]] of the [[Nyingma]] tradition of [[Tibetan Buddhism]]. It is located in [[Kham]] within modern day [[Dêgê County]], [[Garzê Tibetan Autonomous Prefecture]], [[Sichuan]], [[China]].</div></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>==History==</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>==History==</div></td>
</tr>

<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-946272067:rev-976551791:1.10.0 -->`,
};
