var maxLength = 128;
var showPrivateElements = false;
var file = undefined;

function dumpDataSet(dataSet, jsonArray) {
	function getTag(tag) {
		var group = tag.substring(1, 5);
		var element = tag.substring(5, 9);
		var tagIndex = ('(' + group + ',' + element + ')').toUpperCase();
		var attr = TAG_DICT[tagIndex];
		if (attr) {
			attr.element = 'x' + element;
			attr.group = 'x' + group;
		}
		return attr;
	}

	// helper function to see if a string only has ascii characters in it
	function isASCII(str) {
		return /^[\x00-\x7F]*$/.test(str);
	}

	function mapUid(str) {
		var uid = uids[str];
		if (uid) {
			return uid;
		}
		return;
	}
	try {
		var keys = [];
		for (var propertyName in dataSet.elements) {
			keys.push(propertyName);
		}
		keys.sort();
		// the dataSet.elements object contains properties for each element parsed.  The name of the property
		// is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
		// element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
		// be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
		// contents to add to the output array
		for (var k = 0; k < keys.length; k++) {
			var propertyName = keys[k];
			var element = dataSet.elements[propertyName];
			if (showPrivateElements === false && dicomParser.isPrivateTag(element.tag)) {
				continue;
			}
			var tag = getTag(element.tag);
			tag.value = dataSet.string(propertyName);
			tag._hex = element.tag
			tag.length = element.length
			tag.hadUndefinedLength = element.hadUndefinedLength;
			tag.vr = element.vr;

			// Here we check for Sequence items and iterate over them if present.  items will not be set in the
			// element object for elements that don't have SQ VR type.  Note that implicit little endian
			// sequences will are currently not parsed.
			if (element.items) {
				// each item contains its own data set so we iterate over the items
				// and recursively call this function
				var itemNumber = 0;
				var items = [];
				element.items.forEach(function(item) {
					dumpDataSet(item.dataSet, items);
				});
				tag.items = items;
			} else if (element.fragments) {
				tag.basicOffsetTable = element.basicOffsetTable;
				tag.encapsulatedPixelData = element.encapsulatedPixelData;
				tag.fragments = element.fragments;
			} else {
				// use VR to display the right value
				var vr;
				if (element.vr !== undefined) {
					vr = element.vr;
				} else {
					if (tag !== undefined) {
						vr = tag.vr;
					}
				}
				// if the length of the element is less than 128 we try to show it.  We put this check in
				// to avoid displaying large strings which makes it harder to use.
				if (element.length < maxLength) {
					// Since the dataset might be encoded using implicit transfer syntax and we aren't using
					// a data dictionary, we need some simple logic to figure out what data types these
					// elements might be.  Since the dataset might also be explicit we could be switch on the
					// VR and do a better job on this, perhaps we can do that in another example
					// First we check to see if the element's length is appropriate for a UI or US VR.
					// US is an important type because it is used for the
					// image Rows and Columns so that is why those are assumed over other VR types.
					if (element.vr === undefined && tag === undefined) {
						if (element.length === 2) {
							tag.value = dataSet.uint16(propertyName);
						} else if (element.length === 4) {
							tag.value = dataSet.uint32(propertyName);
						}
						// Next we ask the dataset to give us the element's data in string form.  Most elements are
						// strings but some aren't so we do a quick check to make sure it actually has all ascii
						// characters so we know it is reasonable to display it.
						var str = dataSet.string(propertyName);
						var stringIsAscii = isASCII(str);
						if (stringIsAscii) {
							// the string will be undefined if the element is present but has no data
							// (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
							// data.  Note that the length of the element will be 0 to indicate "no data"
							// so we don't put anything here for the value in that case.
							if (str !== undefined) {
								tag.description = mapUid(str)
							}
						} else {
							if (element.length !== 2 && element.length !== 4) {
								// If it is some other length and we have no string
								tag.description = "Binary Data";
							}
						}
					} else {
						function isStringVr(vr) {
							var onArray = ['AT', 'FL', 'FD', 'OB', 'OF', 'OW', 'SI', 'SQ', 'SS', 'UL', 'US'];
							if (onArray.indexOf(vr) > -1) {
								return false;
							}
							return true;
						}
						if (isStringVr(vr)) {
							// Next we ask the dataset to give us the element's data in string form.  Most elements are
							// strings but some aren't so we do a quick check to make sure it actually has all ascii
							// characters so we know it is reasonable to display it.
							var str = dataSet.string(propertyName);
							var stringIsAscii = isASCII(str);
							if (stringIsAscii) {
								// the string will be undefined if the element is present but has no data
								// (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
								// data.  Note that the length of the element will be 0 to indicate "no data"
								// so we don't put anything here for the value in that case.
								if (str !== undefined) {
									tag.description = mapUid(str);
								}
							} else {
								if (element.length !== 2 && element.length !== 4) {
									// If it is some other length and we have no string
									tag.value = "Binary Data";
								}
							}
						} else if (vr === 'US') {
							tag.value = dataSet.uint16(propertyName);
						} else if (vr === 'SS') {
							tag.value = dataSet.int16(propertyName);
						} else if (vr === 'UL') {
							tag.value = dataSet.uint32(propertyName);
						} else if (vr === 'SL') {
							tag.value = dataSet.int32(propertyName);
						} else if (vr == 'FD') {
							tag.value = dataSet.double(propertyName);
						} else if (vr == 'FL') {
							tag.value = dataSet.float(propertyName);
						} else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
							color = '#C8C8C8';
							// If it is some other length and we have no string
							if (element.length === 2) {
								tag.value = "Binary data of length " + element.length + " as uint16: " + dataSet.uint16(propertyName);
							} else if (element.length === 4) {
								tag.value = "Binary data of length " + element.length + " as uint32: " + dataSet.uint32(propertyName);
							} else {
								tag.value = "Binary data of length " + element.length + " and VR " + vr;
							}
						} else if (vr === 'AT') {
							var group = dataSet.uint16(propertyName, 0);
							var groupHexStr = ("0000" + group.toString(16)).substr(-4);
							var element = dataSet.uint16(propertyName, 1);
							var elementHexStr = ("0000" + element.toString(16)).substr(-4);
							tag.value = "x" + groupHexStr + elementHexStr;
						} else if (vr === 'SQ') {} else {
							// If it is some other length and we have no string
							tag.value = "No display code for VR " + vr + " yet, sorry!";
						}
					}
				} else {
					// Add text saying the data is too long to show...
					tag.description = "Data of length " + element.length + " for VR + " + vr + " too long to show";
				}
			}
			jsonArray.push(tag);
		}
	} catch (err) {
		var ex = {
			exception: err,
			output: jsonArray
		}
		throw ex;
	}
}