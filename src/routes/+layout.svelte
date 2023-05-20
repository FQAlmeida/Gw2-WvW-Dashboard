<script lang="ts">
    import TopAppBar, {
        Row,
        Section,
        Title,
        AutoAdjust,
    } from "@smui/top-app-bar";
    import IconButton, { Icon } from "@smui/icon-button";

    let topAppBar: TopAppBar;
    import Drawer, { AppContent, Content, Header, Scrim } from "@smui/drawer";
    import List, { Item, Text, Graphic, Separator } from "@smui/list";
    import { mdiGithub, mdiChartLine } from "@mdi/js";
    import { Svg } from "@smui/common";

    let open = false;
</script>

<TopAppBar bind:this={topAppBar} variant="standard">
    <Row>
        <Section>
            <IconButton
                class="material-icons"
                on:click={() => (open = !open)}
                aria-label="menu"
            >
                menu
            </IconButton>
            <Title>Gw2 WvW Dashboard</Title>
        </Section>
        <Section align="end" toolbar>
            <IconButton
                class="material-icons"
                aria-label="github"
                size="normal"
            >
                <Icon component={Svg} viewBox="0 0 24 24">
                    <path fill="currentColor" d={mdiGithub} />
                </Icon>
            </IconButton>
        </Section>
    </Row>
</TopAppBar>
<Drawer variant="dismissible" bind:open>
    <Header>
        <Row>
            <Section>
                <Title>Menu</Title>
            </Section>
            <!-- <Subtitle>It's the best drawer.</Subtitle> -->
            <Section align="end">
                <IconButton
                    class="material-icons"
                    on:click={() => (open = !open)}
                    aria-label="keyboard_backspace"
                >
                    keyboard_backspace
                </IconButton>
            </Section>
        </Row>
    </Header>
    <Content>
        <Separator />
        <List>
            <Item href="javascript:void(0)">
                <Graphic>
                    <Icon component={Svg} viewBox="0 0 24 24">
                        <path fill="currentColor" d={mdiChartLine} />
                    </Icon>
                </Graphic>
                <Text>Charts</Text>
            </Item>
        </List>
    </Content>
</Drawer>
<Scrim fixed={false} />
<AutoAdjust {topAppBar}>
    <AppContent class="app-content">
        <slot />
    </AppContent>
</AutoAdjust>
