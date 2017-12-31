const ricEscape = require('../index.js');
const ricEscapeData = require('../ric-escape-data').data;
const scure = require('../scure/scure').buildScureFor(ricEscapeData);

describe('Ric Escape - when using', () => {
  const WRONG_ARG_DATA = [
    { arg: null, expectedSentence: 'use-noarg', comment: 'no arg' },
    { arg: 'Cuadro', expectedSentence: 'use-cant', comment: 'object does not exist' },
    { arg: 'sillas', expectedSentence: 'use-cant', comment: 'object cannot be used' },
  ];

  WRONG_ARG_DATA.forEach((data) => {
    it(`tells you cannot be used or wrong object when: ${data.comment}`, () => {
      const request = aDfaRequestBuilder()
        .withIntent('use')
        .withArgs({ arg: data.arg })
        .withData({ roomId: 'sala-mandos' })
        .build();

      ricEscape.ricEscape(request);

      expect(getDfaApp().lastAsk).to.equal(scure.sentences.get(data.expectedSentence));
    });
  });

  it('tells you cannot be used if not in room', () => {
    const request = aDfaRequestBuilder()
      .withIntent('use')
      .withArgs({ arg: 'diario' })
      .withData({ roomId: 'pasillo-norte' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().lastAsk).to.equal(scure.sentences.get('use-cant'));
  });

  describe('using objects ok several times', () => {
    const TEST_DATA = [
      { usages: null, expectedText: 'Los primeros minutos del diario', nextUsage: 1 },
      { usages: [], expectedText: 'Los primeros minutos del diario', nextUsage: 1 },
      { usages: { 'sala-mandos-diario': 1 }, expectedText: 'Los siguientes minutos del diario', nextUsage: 2 },
      { usages: { 'sala-mandos-diario': 2 }, expectedText: 'Los últimos minutos del diario', nextUsage: 3 },
      { usages: { 'sala-mandos-diario': 3 }, expectedText: 'Los primeros minutos del diario', nextUsage: 4 },
    ];

    TEST_DATA.forEach((data) => {
      it(`responds depending of number of times used ${data.usages && data.usages['sala-mandos-diario']}`, () => {
        const request = aDfaRequestBuilder()
          .withIntent('use')
          .withArgs({ arg: 'diario' })
          .withData({ roomId: 'sala-mandos', usages: data.usages })
          .build();

        ricEscape.ricEscape(request);

        expect(getDfaApp().lastAsk).to.contains(data.expectedText);
        expect(getDfaApp().data.usages['sala-mandos-diario']).to.equal(data.nextUsage);
      });
    });
  });

  describe('when unlocking actions', () => {
    it('adds to unlocked array', () => {
      const request = aDfaRequestBuilder()
        .withIntent('use')
        .withArgs({ arg: 'diario de abordo' })
        .withData({ roomId: 'sala-mandos', usages: { 'sala-mandos-diario': 1 } })
        .build();

      ricEscape.ricEscape(request);

      expect(getDfaApp().data.unlocked).to.eql(['hab108']);
    });
    it('does not add it twice', () => {
      const request = aDfaRequestBuilder()
        .withIntent('use')
        .withArgs({ arg: 'diario de abordo' })
        .withData({ roomId: 'sala-mandos', unlocked: ['hab108'], usages: { 'sala-mandos-diario': 4 } })
        .build();

      ricEscape.ricEscape(request);

      expect(getDfaApp().data.unlocked).to.eql(['hab108']);
    });
  });

  it('uses items even if wrongly accented', () => {
    const request = aDfaRequestBuilder()
      .withIntent('use')
      .withArgs({ arg: 'diário' })
      .withData({ roomId: 'sala-mandos' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().data.usages['sala-mandos-diario']).to.equal(1);
  });

  it('uses item from the inventory', () => {
    const request = aDfaRequestBuilder()
      .withIntent('use')
      .withArgs({ arg: 'cartera' })
      .withData({ roomId: 'sala-mandos', picked: ['comedor-cartera'] })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().data.usages['comedor-cartera']).to.equal(1);
  });

  it('provides - picks items if is a pickable action and disposes old one', () => {
    const request = aDfaRequestBuilder()
      .withIntent('use')
      .withArgs({ arg: 'cartera' })
      .withData({ roomId: 'pasillo-norte', picked: ['comedor-cartera'] })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().lastAsk).to.contains('Veo que');
    expect(getDfaApp().data.picked).to.not.contains('comedor-cartera');
    expect(getDfaApp().data.picked).to.contains('combinacion-4815');
  });

  it('provides - picks items if a pickable action even if I dont have it but im in the place', () => {
    const request = aDfaRequestBuilder()
      .withIntent('use')
      .withArgs({ arg: 'cartera' })
      .withData({ roomId: 'comedor' })
      .build();

    ricEscape.ricEscape(request);

    expect(getDfaApp().lastAsk).to.contains('Veo que');
    expect(getDfaApp().data.picked).to.not.contains('comedor-cartera');
    expect(getDfaApp().data.picked).to.contains('combinacion-4815');
  });
});
