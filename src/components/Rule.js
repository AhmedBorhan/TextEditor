import React from 'react';
import PropTypes from 'prop-types';
import DeleteIcon from '../icons/delete.svg';
// import EditIcon from '../icons/pencil-tool.svg';
import EditIcon from '../icons/floppy-disk.svg';


function Rule(props) {
  const { index, search, replace, checked,onChangeRule, onChangeCheck, isChanged, id } = props;
	return (
		<div className="search-and-replace">
			<div className={'actions'}>
				<img width="16px" height="16px" src={DeleteIcon} alt="this is delete" />
				<img onClick={() =>{}} className={isChanged ? '' : 'disabled'} width="16px" height="16px" src={EditIcon} alt="this is delete" />
				<input onChange={(e) =>{onChangeCheck(e,index)}} name="isGoing" type="checkbox" checked={checked} />
			</div>
			<input name="replace" value={replace} onChange={(e) =>onChangeRule(e,index)} placeholder="جێگرەوە" />
			<input name="search" value={search} onChange={(e) =>onChangeRule(e,index)} placeholder="وشە" />
		</div>
	);
}

Rule.propTypes = {
	index: PropTypes.number,
	search: PropTypes.string,
	replace: PropTypes.string,
	checked: PropTypes.bool,
	isChanged: PropTypes.bool,
	onChangeRule: PropTypes.func,
	onChangeCheck: PropTypes.func
};

export default Rule;
