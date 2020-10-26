import React, { useState, useEffect } from 'react';
// Editor from draft
import { Editor, EditorState, CompositeDecorator, SelectionState, Modifier } from 'draft-js';
// Database actions
import { getRules, addRule, updateRule, deleteRule } from './db-actions';
// Icons
import DeleteIcon from './icons/delete.svg';
import EditIcon from './icons/floppy-disk.svg';
import ReplaceIcon from './icons/find.svg';
import AddIcon from './icons/plus.svg';

const findWithRegex = (regex, contentBlock, callback) => {
	const text = contentBlock.getText();
	let matchArr, start, end;
	while ((matchArr = regex.exec(text)) !== null) {
		start = matchArr.index;
		end = start + matchArr[0].length;
		callback(start, end);
	}
};

const SearchHighlight = (props) => <span className="search-and-replace-highlight">{props.children}</span>;

const generateDecorator = (highlightTerm) => {
	const regex = new RegExp(highlightTerm, 'g');
	return new CompositeDecorator([
		{
			strategy: (contentBlock, callback) => {
				if (highlightTerm !== '') {
					findWithRegex(regex, contentBlock, callback);
				}
			},
			component: SearchHighlight
		}
	]);
};

function App() {
	const [ editorState, setEditorState ] = React.useState(EditorState.createEmpty());
	const [ state, setState ] = useState({ text: '', replace: '' });
	const [ rules, setRules ] = useState([]);

	const editor = React.useRef(null);
	function focusEditor() {
		editor.current.focus();
	}

	const fetchRules = async () => {
		const rules = await getRules();
		setRules(rules);
	};

	useEffect(() => {
		focusEditor();
		fetchRules();
	}, []);

	const onChangeSearch = (e) => {
		e.preventDefault();
		const text = e.target.value;
		setState({ ...state, text });
		setEditorState(EditorState.set(editorState, { decorator: generateDecorator(text) }));
	};

	const handleFocuse = (e) => {
		const { value } = e.target;
		setEditorState(EditorState.set(editorState, { decorator: generateDecorator(value) }));
	};

	const onChangeReplace = (e) => {
		setState({
			...state,
			replace: e.target.value
		});
	};

	const onChangeRule = (e, index) => {
		const { value, name } = e.target;
		const newRules = rules;
		name === 'search' ? (newRules[index].text = value) : (newRules[index].replace = value);
		if (name === 'search') setEditorState(EditorState.set(editorState, { decorator: generateDecorator(value) }));
		newRules[index].isChanged = true;
		setRules([ ...newRules ]);
	};

	const onChangeCheck = (e, index) => {
		const isChecked = e.target.checked;
		const newRules = rules;
		newRules[index].checked = isChecked;
		newRules[index].isChanged = true;
		setRules([ ...newRules ]);
	};

	const handelAddRule = async () => {
		const exist = rules.filter((rule) => rule.text === state.text && rule.replace === state.replace);

		if (state.replace !== '' && state.text !== '' && exist.length < 1) {
			const newRule = await addRule(state);
			if (newRule !== null) {
				setRules([ ...rules, newRule ]);
				setState({ text: '', replace: '' });
			}
		}
	};

	const handelUpdateRule = async (rule, index) => {
		if (rule.text !== '' && rule.replace !== '') {
			const res = await updateRule(rule);
			const newRules = rules;
			newRules[index].isChanged = false;
			if (res !== null) setRules([ ...newRules ]);
		}
	};

	const handleDeleteRule = async (rule, index) => {
		const res = await deleteRule(rule.id);
		const newRules = rules;
		newRules.splice(index, 1);
		if (res) setRules([ ...newRules ]);
	};

	const handleCheckAll = (e) => {
		const newRules = rules;
		const isChecked = e.target.checked;
		for (let index = 0; index < newRules.length; index++) {
			if (newRules[index].checked !== isChecked) {
				newRules[index].checked = isChecked;
				newRules[index].isChanged = true;
			}
		}
		setRules([ ...rules ]);
	};

	const onReplace = (theRules) => {
		let contentState = editorState.getCurrentContent();
		if (state.text !== '' && state.replace !== '') theRules = [ ...theRules, { ...state, checked: true } ];
		for (let i = 0; i < theRules.length; i++) {
			const { text, replace, checked } = theRules[i];
			if (!checked) continue;
			const regex = new RegExp(text, 'g');
			const selectionsToReplace = [];
			//contentState = editorState.getCurrentContent();
			const blockMap = contentState.getBlockMap();

			blockMap.forEach((contentBlock) =>
				findWithRegex(regex, contentBlock, (start, end) => {
					const blockKey = contentBlock.getKey();
					const blockSelection = SelectionState.createEmpty(blockKey).merge({
						anchorOffset: start,
						focusOffset: end
					});

					selectionsToReplace.push(blockSelection);
				})
			);

			selectionsToReplace.forEach((selectionState) => {
				contentState = Modifier.replaceText(contentState, selectionState, replace);
			});
		}

		setEditorState(EditorState.push(editorState, contentState));
	};

	return (
		<div className={'all-container'}>
			<section className={'editor-section'}>
				<Editor ref={editor} editorState={editorState} onChange={setEditorState} />
			</section>
			<section className={'rules-section'}>
				<div className="search-and-replace">
					<small align="right">
						<input name="isGoing" type="checkbox" onChange={handleCheckAll} />گشت
					</small>
					<button className={'replace-btn'} onClick={() => onReplace(rules)}>
						پەسەندکردن
					</button>
				</div>
				<div className="search-and-replace">
					<div className={'actions'}>
						<img width="24px" height="24px" src={ReplaceIcon} onClick={() => onReplace([])} alt="replace" />
						<img
							width="24px"
							height="24px"
							onClick={handelAddRule}
							className={state.replace && state.text ? '' : 'disabled'}
							src={AddIcon}
							alt="add"
						/>
					</div>
					<input value={state.replace} onChange={onChangeReplace} placeholder="جێگرەوە" />
					<input value={state.text} onFocus={handleFocuse} onChange={onChangeSearch} placeholder="وشە" />
				</div>
				<hr />
				{rules.map((rule, index) => (
					<div className="search-and-replace" key={index}>
						<div className={'actions'}>
							<img
								onClick={() => {
									handleDeleteRule(rule, index);
								}}
								width="16px"
								height="16px"
								src={DeleteIcon}
								alt="delete"
							/>
							<img
								onClick={() => handelUpdateRule(rule, index)}
								className={rule.isChanged === true ? '' : 'disabled'}
								width="16px"
								height="16px"
								src={EditIcon}
								alt="update"
							/>
							<input
								onChange={(e) => {
									onChangeCheck(e, index);
								}}
								name="isGoing"
								type="checkbox"
								checked={rule.checked}
							/>
						</div>
						<input name="replace" value={rule.replace} onChange={(e) => onChangeRule(e, index)} placeholder="جێگرەوە" />
						<input
							name="search"
							value={rule.text || ''}
							onFocus={handleFocuse}
							onChange={(e) => onChangeRule(e, index)}
							placeholder="وشە"
						/>
					</div>
				))}
			</section>
		</div>
	);
}

export default App;
