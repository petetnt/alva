import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

interface ElementWrapperState {
	isResizing: boolean;
	direction: number;
	width: number;
	maxWidth: number;
	mousePosition?: number;
}

interface StyledElementWrapperProps {
	width?: number;
}

const StyledPreviewWrapper = styled.div`
	display: inline-flex;
	justify-content: center;
	flex-grow: 1;
	flex-shrink: 0;
`;

const StyledPreviewResizer = styled.div`
	width: 12px;
	height: 100%;
	cursor: ew-resize;
	&::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 36px;
		width: 6px;
		margin: 3px;
		border-radius: 5px;
		background: grey;
	}
`;

const StyledPreviewPane = styled.div`
	max-width: ${(props: StyledElementWrapperProps) => `${props.width}px` || 'none'};
	flex-grow: 1;
	overflow: hidden;
	background: ${colors.white.toString()};
	border-radius: 6px 6px 0 0;
	box-shadow: 0 3px 9px 0 ${colors.black.toRGBString(0.15)};
`;

export default class PreviewPane extends React.Component<null, ElementWrapperState> {
	private previewPane: HTMLElement | null;

	public constructor(props: null) {
		super(props);

		this.state = {
			isResizing: false,
			direction: 1,
			width: 0,
			maxWidth: 0
		};

		this.handleMouseDownRight = this.handleMouseDownRight.bind(this);
		this.handleMouseDownLeft = this.handleMouseDownLeft.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
	}

	private handleMouseDownRight(e: React.MouseEvent<HTMLElement>): void {
		this.setState({
			isResizing: true,
			mousePosition: e.pageX,
			direction: 1
		});
	}

	private handleMouseDownLeft(e: React.MouseEvent<HTMLElement>): void {
		this.setState({
			isResizing: true,
			mousePosition: e.pageX,
			direction: -1
		});
	}

	private handleMouseUp(): void {
		this.setState({
			isResizing: false,
			mousePosition: undefined
		});
	}

	private handleMouseLeave(): void {
		const { mousePosition, maxWidth } = this.state;

		if (!mousePosition) {
			return;
		}

		this.setState({
			isResizing: false,
			mousePosition: undefined,
			width: maxWidth
		});
	}

	private handleMouseMove(e: React.MouseEvent<HTMLElement>): void {
		const { mousePosition, width, direction } = this.state;

		if (!mousePosition) {
			return;
		}
		e.preventDefault();

		const newWidth = width - (mousePosition - e.pageX) * 2 * direction;
		this.setState({
			width: newWidth >= 300 ? newWidth : 300,
			mousePosition: e.pageX
		});
	}

	public componentDidMount(): void {
		if (!this.previewPane) {
			return;
		}

		const previewWidth = this.previewPane.offsetWidth;
		this.setState({
			width: previewWidth,
			maxWidth: previewWidth
		});
	}

	public render(): JSX.Element {
		return (
			<StyledPreviewWrapper
				innerRef={(ref: HTMLElement | null) => (this.previewPane = ref)}
				onMouseMove={this.handleMouseMove}
				onMouseUp={this.handleMouseUp}
				onMouseLeave={this.handleMouseLeave}
			>
				<StyledPreviewResizer onMouseDown={this.handleMouseDownLeft} />
				<StyledPreviewPane
					width={this.state.width}
					dangerouslySetInnerHTML={{
						__html:
							'<webview id="preview" style="height: 100%; border-radius: 6px 6px 0 0; overflow: hidden;" src="./preview.html" partition="electron" nodeintegration />'
					}}
				/>
				<StyledPreviewResizer onMouseDown={this.handleMouseDownRight} />
			</StyledPreviewWrapper>
		);
	}
}
