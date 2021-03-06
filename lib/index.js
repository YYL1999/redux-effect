'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// 格式化reducers，输入任意数量models，返回标准reducers对象
const reduxReduers = (models) => {
  const reducers = {};
  models.map((model) => {
    reducers[model.namespace] = (state, action) => {
      const [key, type] = action.type.split('/');
      if (key && type && key === model.namespace && typeof model.reducers[type] === 'function') {
        return model.reducers[type](state, action);
      }
      return state || model.state || {};
    };
  });
  return reducers;
};


// 格式化effects，输入任意数量models，返回effects中间件
const reduxEffects = models => store => next => async (action) => {
  next(action);
  const [key, type] = action.type.split('/');
  if (!key || !type) return;
  const model = models.find(i => i.namespace === key);
  if (model && model.effects && typeof model.effects[type] === 'function') {
    await model.effects[type](store, action);
  }
};

// 格式化effects，输入任意数量models，返回effects中间件 
const reduxEffectsWidthLoading = models => store => next => async (action) => {
  next(action);
  const [key, type] = action.type.split('/');
  if (!key || !type) return;
  const model = models.find(i => i.namespace === key);
  if (model && model.effects && typeof model.effects[type] === 'function') {
    await store.dispatch({ type: 'loading/save', payload: { [action.type]: true } });
    await model.effects[type](store, action);
    await store.dispatch({ type: 'loading/save', payload: { [action.type]: false } });
  }
};

exports.reduxEffects = reduxEffects;
exports.reduxEffectsWidthLoading = reduxEffectsWidthLoading;
exports.reduxReduers = reduxReduers;
